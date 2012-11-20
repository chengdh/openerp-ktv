//定义ktv开房pos界面
openerp.ktv_sale = function(db) {
	//定义基于bootstrap的modal的dialog类
	db.web.BootstrapModal = db.web.OldWidget.extend(
	/** @lends openerp.web.Dialog# */
	{
		/**
     * @constructs openerp.web.Dialog
     * @extends openerp.web.OldWidget
     *
     * @param parent
     * @param options
     */
		init: function(parent, options) {
			var self = this;
			this._super(parent);
			this.dialog_options = {
				width: 'auto',
				backdrop: 'static',
				keyboard: true,
				show: true,
				remote: false
			};
			if (options) {
				_.extend(this.dialog_options, options);
			}
			if (this.dialog_options.show) {
				this.open();
			} else {
				this.$element.find(".modal").modal(this.dialog_options);
			}
		},
		open: function(options) {
			var self = this;
			this.appendTo($('body'));
			this.$element.find(".modal").modal(this.dialog_options).css({
				width: self.dialog_options.width,
				'margin-left': function() {
					return - ($(this).width() / 2);
				}
			}).on('hidden', _.bind(this.stop, this)).modal('show');
			return this;
		},
		close: function() {
			this.$element.find(".modal").modal('hide');
		},
		stop: function() {
			// Destroy widget
			this.close();
			this._super();
		}
	});

	db.ktv_sale = {};
	//工具类
	db.ktv_sale.util = {
		//判断给定的日期是周几
		//返回星期缩写mon/tue/wed等
		get_week_day: function(a_date) {
			var dx = ("sun mon tue wed thu fri sat").split(/\s/);
			var day_of_week = _.find(dx, function(w_day) {
				return a_date().is()[w_day]();
			});
			return day_of_week;
		},
		//得到当日是周几
		today_week_day: function() {
			return db.ktv_sale.util.get_week_day(Date.today);
		}

	};
	//房态常数量
	db.ktv_sale.room_state = {};
	db.ktv_sale.room_state.states = {
		FREE: ["free", "空闲"],
		IN_USE: ["in_use", "使用中"],
		SCHEDULED: ["scheduled", "已预定"],
		LOCKED: ["locked", "锁定"],
		CHECKOUT: ["checkout", "已结账"],
		BUYOUT: ["buyout", "买断"],
		BUYTIME: ["buytime", "买钟"],
		MALFUNCTION: ["malfunction", "故障"],
		VISIT: ["visit", "带客看房"],
		CLEAN: ["clean", "清洁中"],
		DEBUG: ["debug", "调试中"]
	};
	//包厢状态key数组
	db.ktv_sale.room_state.key_states = function() {
		ret = [];
		for (s in db.ktv_sale.room_state.states) {
			ret.push(db.ktv_sale.room_state.states[s][0]);
		}
		return ret;
	} ();
	//获取包厢状态中文描述
	db.ktv_sale.room_state.get_state_desc = function(a_state) {
		var state_desc = ""
		var states = db.ktv_sale.room_state.states;
		for (s in states) {
			if (states[s][0] == a_state) state_desc = states[s][1];
		}
		return state_desc;

	};
	//判断当前包厢可做的动作
	//do_operate  当前要操作的房态
	//return 返回可以操作时房态数组
	db.ktv_sale.room_state.array_states_on_operate = function(do_operate) {
		var key_states = db.ktv_sale.room_state.key_states;
		//[已结账 锁定 已预定 清洁中 带客看房 清洁中 调试中] -- 空置操作
		if (do_operate == 'room_free') {
			var array_states = [
			db.ktv_sale.room_state.states.CHECKOUT[0], db.ktv_sale.room_state.states.LOCKED[0], db.ktv_sale.room_state.states.MALFUNCTION[0], db.ktv_sale.room_state.states.CLEAN[0], db.ktv_sale.room_state.states.SCHEDULED[0], db.ktv_sale.room_state.states.CHECKOUT[0], db.ktv_sale.room_state.states.VISIT[0], db.ktv_sale.room_state.states.DEBUG[0]];
			return array_states;
		}
		//预定操作
		if (do_operate == 'room_scheduled') {
			var array_states = [
			db.ktv_sale.room_state.states.FREE[0], db.ktv_sale.room_state.states.SCHEDULED[0], //已预定的房间还可以再预定
			db.ktv_sale.room_state.states.CHECKOUT[0], db.ktv_sale.room_state.states.CLEAN[0]];
			return array_states;
		}
		//取消预定操作
		if (do_operate == 'cancel_scheduled') {
			var array_states = [
			db.ktv_sale.room_state.states.SCHEDULED[0] //已预定的房间还可以再预定
			];
			return array_states;
		}
		//正常开房/买钟/买断操作
		if (do_operate == 'room_open' || do_operate == "room_buytime" || do_operate == "room_buyout") {
			var array_states = [
			db.ktv_sale.room_state.states.FREE[0], db.ktv_sale.room_state.states.SCHEDULED[0], //已预定的房间还可以再预定
			db.ktv_sale.room_state.states.CHECKOUT[0]];
			return array_states;
		}
		//续钟/退钟操作
		if (do_operate == 'room_buytime_continue || room_buytime_back') {
			var array_states = [
			db.ktv_sale.room_state.states.BUYTIME][0];
			return array_states;
		}
		//结账操作
		if (do_operate == 'room_checkout') {
			var array_states = [
			db.ktv_sale.room_state.states.IN_USE][0];
			return array_states;
		}

	};

	//扩展通用的模板方法
	var QWeb = db.web.qweb;
	var qweb_template = function(template) {
		return function(ctx) {
			return QWeb.render(template, _.extend({},
			ctx, {
				//以下定义需要在界面上显示的数据
				'room_types': ktv_room_pos.store.get('ktv.room_type'),
				'room_areas': ktv_room_pos.store.get('ktv.room_area'),
				'fee_types': ktv_room_pos.store.get('ktv.fee_type'),
				'price_classes': ktv_room_pos.store.get('ktv.price_class'),
				'currency': ktv_room_pos.get('currency'),
				'format_amount': function(amount) {
					if (ktv_room_pos.get('currency').position == 'after') {
						return amount + ' ' + ktv_room_pos.get('currency').symbol;
					} else {
						return ktv_room_pos.get('currency').symbol + ' ' + amount;
					}
				},
			}));
		};
	};
	var _t = db.web._t;

	/*
     使用浏览器的localstorage存储数据
     */
	var Store = db.web.Class.extend({
		init: function() {
			this.data = {};
		},
		get: function(key, _default) {
			if (this.data[key] === undefined) {
				var stored = localStorage['oe_ktv_' + key];
				if (stored) this.data[key] = JSON.parse(stored);
				else return _default;
			}
			return this.data[key];
		},
		set: function(key, value) {
			this.data[key] = value;
			localStorage['oe_ktv_' + key] = JSON.stringify(value);
		},
	});

	//从服务器端获取所有相关对象,并存储到本地的localstorage中去
	db.ktv_sale.KtvRoomPos = Backbone.Model.extend({
		initialize: function(session, attribute) {
			Backbone.Model.prototype.initialize.call(this, attributes);
			//设置全局变量
			ktv_room_pos = this;
			var self = this;
			this.store = new Store();
			this.ready = $.Deferred();
			this.flush_mutex = new $.Mutex();
			this.session = session;
			//定义pos特有的属性,由于可能有多个pos终端,这些属性都不同
			var attributes = {
				//挂起还未与服务器端同步的操作
				'pending_operations': [],
				//货币符号
				'currency': {
					symbol: '$',
					position: 'after'
				},
				//当前商店,可能会有多个商店
				'shop': {},
				'user': {} //当前登录用户
			};
			_.each(attributes, _.bind(function(def, attr) {
				var to_set = {};
				to_set[attr] = this.store.get(attr, def);
				this.set(to_set);
				this.bind('change:' + attr, _.bind(function(unused, val) {
					this.store.set(attr, val);
				},
				this));
			},
			this));
			//自服务器端获取数据
			var func_fetch_array = [];
			for (attr in this.osv_objects) {
				func_fetch_array.push(this._fetch(attr, this.osv_objects[attr]['fields'], this.osv_objects[attr]['domain']));
			}
			$.when.apply(this, func_fetch_array).pipe(_.bind(this.set_app_data, this));
		},
		//获取相关数据
		set_app_data: function() {
			var self = this;
			//所有房间列表
			self.rooms_all = new db.ktv_sale.RoomCollection(self.store.get('ktv.room'));
			//获取包厢操作对象
			self.room_operates = new db.ktv_sale.RoomOperateCollection(self.store.get('ktv.room_operate'));
			//将包厢操作中的room
			return this.ready.resolve();
		},
		//根据包厢状态返回包厢数组
		get_rooms_by_state: function(r_state) {
			var rooms_filted = new db.ktv_sale.RoomCollection();
			if (r_state) ret = this.rooms_all.filter(function(r) {
				if (_.isArray(r_state)) return _.contains(r_state, r.get("state"));
				else return r.get("state") == r_state;
			});
			rooms_filted.add(ret);
			return rooms_filted;
		},
		//根据id获取room
		get_room: function(room_id) {
			return this.rooms_all.get(room_id);
		},
		//自服务器端获取数据,并保存到browser的localstorage中去
		_fetch: function(osvModel, fields, domain) {
			var dataSetSearch;
			var self = this;

			dataSetSearch = new db.web.DataSetSearch(this, osvModel, {},
			domain);
			return dataSetSearch.read_slice(fields, 0).then(function(result) {
				return self.store.set(osvModel, result);
			});
		},

		push_room_operate: function(record_b) {
			//先更新room_operate到localStorage
			this.update_room_operate_to_local(record_b);
			//保存room_operate对象到localStorate
			var ops = _.clone(this.get('pending_operations'));
			//FIXME _b表示是Backbone对象
			var pending_ops_b = new db.ktv_sale.RoomOperateCollection(ops);
			var finded_op_b = pending_ops_b.find(function(op) {
				return op.get("bill_no") == record_b.get("bill_no");
			});
			if (finded_op_b) {
				pending_ops_b.without(finded_op_b);
			}
			pending_ops_b.add(record_b);
			this.set({
				pending_operations: pending_ops_b.export_as_json()
			});
			return this.flush();
		},
		//更新本地localStorage中的包厢操作对象
		update_room_operate_to_local: function(room_operate_b) {
			var finded_op = this.room_operates.find(function(op) {
				return op.get("bill_no") == room_operate_b.get("bill_no");
			});
			if (finded_op) {
				this.room_operates.without(finded_op);
			}
			this.room_operates.add(room_operate_b);
			this.store.set('ktv.room_operate', this.room_operates.export_as_json());
		},
		//根据bill_no获取room_operate对象
		//FIXME 此处返回的是Backbone包装过的room_operate对象
		get_room_operate_b: function(bill_no) {
			var ret = this.room_operates.find(function(op_b) {
				return op_b.get("bill_no") == bill_no;
			});
			return ret;
		},
		flush: function() {
			return this.flush_mutex.exec(_.bind(function() {
				return this._int_flush();
			},
			this));
		},
		_int_flush: function() {
			var ops = this.get('pending_operations');
			if (ops.length === 0) return $.when();
			var op = ops[0];
			/* we prevent the default error handler and assume errors
             * are a normal use case, except we stop the current iteration
             */
			return new db.web.Model("ktv.room_scheduled").get_func("create_from_ui")([op]).fail(function(unused, event) {
				event.preventDefault();
			}).pipe(_.bind(function() {
				console.debug('saved 1 record');
				var ops2 = this.get('pending_operations');
				this.set({
					'pending_operations': _.without(ops2, op)
				});
				return this._int_flush();
			},
			this), function() {
				return $.when()
			});
		},
		//需要从服务器端获取的osv对象
		osv_objects: {
			//fee_type  //计费方式
			'ktv.fee_type': {
                'model_class' : 'FeeType',
                'model_collection_class' : 'FeeTypeCollection',
				'fields': ['id', 'fee_type_code', 'name'],
				'domain': []
			},
			//fee_type_member_class_discount //计费方式-会员折扣信息
			'ktv.fee_type_member_class_discount': {
                'model_class' : 'FeeTypeMemberClassDiscount',
                'model_collection_class' : 'FeeTypeMemberClassDiscountCollection',
				'fields': ['fee_type_id', 'memeber_class_id', 'drinks_fee_discount', 'room_fee_discount'],
				'domain': []
			},
			//pay_type //付款方式
			'ktv.pay_type': {
                'model_class' : 'PayType',
                'model_collection_class' : 'PayTypeCollection',
				'fields': ['id', 'name'],
				'domain': []
			},
			//room_area //包厢区域
			'ktv.room_area': {
                'model_class' : 'RoomArea',
				'fields': ['id', 'name'],
				'domain': []
			},
			//room_type  //包厢类别
			'ktv.room_type': {
                'model_class' : 'RoomType',
				'fields': ['id', 'name', 'drinks_price_type', 'fee_type_id', 'serve_persons', 'room_fee', 'hourly_fee', 'hourly_fee_p', 'minimum_fee', 'minimum_fee_p', 'service_fee', 'present_rate'],
				'domain': []
			},
			//room      //包厢信息
			'ktv.room': {
                'model_class' : 'Room',
				'fields': ['id', 'name', 'room_area_id', 'room_type_id', 'fee_type_id', 'ktv_box_ip', 'room_fee', 'hourly_fee', 'minimum_fee', 'hourly_fee_p', 'minimum_fee_p', 'minimum_persons', 'sequence', 'state'],
				'domain': []
			},
			//buyout_config //买断设置
			'ktv.buyout_config': {
                'model_class' : 'BuyoutConfig',
				'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'thu_buyout_enable', 'thu_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'special_day_buyout_fee'],
				'domain': []
			},
			//buyout_config_special_day //买断特殊日设置
			'ktv.buyout_config_special_day': {
                'model_class' : 'BuyoutConfigSpecialDay',
				'fields': ['room_type_id', 'special_day'],
			},

			//buffet_config buffet_config_special_day 自助餐设置
			'ktv.buffet_config': {
                'model_class' : 'BuffetConfig',
				'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'mon_child_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'tue_child_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'wed_child_buyout_fee', 'thu_buyout_enable', 'thu_buyout_fee', 'thu_child_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'fri_child_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sat_child_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'sun_child_buyout_fee', 'special_day_buyout_fee', 'special_day_child_buyout_fee'],
				'domain': []
			},
			'ktv.buffet_config_special_day': {
                'model_class' : 'BuffetConfigSpecialDay',
				'fields': ['room_type_id', 'special_day'],
			},

			//minimum_fee_config minimum_fee_config_special_day时段低消设置
			'ktv.minimum_fee_config': {
                'model_class' : 'MinimumFeeConfig',
				'fields': ['room_type_id', 'time_from', 'time_to', 'mon_minimum_fee', 'mon_minimum_fee_p', 'mon_room_fee', 'tue_minimum_fee', 'tue_minimum_fee_p', 'tue_room_fee', 'wed_minimum_fee', 'wed_minimum_fee_p', 'wed_room_fee', 'thu_minimum_fee', 'thu_minimum_fee_p', 'thu_room_fee', 'fri_minimum_fee', 'fri_minimum_fee_p', 'fri_room_fee', 'sat_minimum_fee', 'sat_minimum_fee_p', 'sat_room_fee', 'sun_minimum_fee', 'sun_minimum_fee_p', 'sun_room_fee', 'special_day_minimum_fee', 'special_day_minimum_fee_p', 'special_day_room_fee'],
				'domain': [['active', '=', true]]
			},
			'ktv.minimum_fee_config_special_day': {
                'model_class' : 'MinimumFeeConfigSpecialDay',
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			//price_class 价格类型
			'ktv.price_class': {
                'model_class' : 'PriceClass',
				'fields': ['id', 'name', 'sequence'],
				'domain': [['active', '=', true]]
			},

			//hourly_fee_discount hourly_fee_p_discount member_hourly_fee_discount 时段钟点费设置
			'ktv.hourly_fee_discount': {
                'model_class' : 'HourlyFeeDiscount',
				'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.hourly_fee_discount_special_day': {
                'model_class' : 'HourlyFeeDiscountSpecialDay',
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount': {
                'model_class' : 'HourlyFeePDiscount',
				'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount_special_day': {
                'model_class' : 'HourlyFeePDiscountSpecialDay',
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount': {
                'model_class' : 'MemberHourlyFeeDiscount',
				'fields': ['id', 'price_class_id', 'member_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount_special_day': {
                'model_class' : 'MemberHourlyFeeDiscountSpecialDay',
				'fields': ['room_type_id', 'member_class_id', 'special_day'],
				'domain': []
			},

			//hourly_fee_promotion 买钟优惠设置
			'ktv.hourly_fee_promotion': {
                'model_class' : 'HourlyFeePromotion',
				'fields': ['id', 'name', 'is_member', 'buy_minutes', 'present_minutes', 'active_datetime_limit', 'datetime_from', 'datetime_to', 'active_time_limit', 'time_from', 'time_to', 'mon_active', 'tue_active', 'wed_active', 'thu_active', 'fri_active', 'sat_active', 'sun_active'],
				'domain': []
			},
			//member_class会员卡等级设置
			'ktv.member_class': {
                'model_class' : 'MemberClass',
				'fields': ['id', 'name', 'card_fee', 'drinks_fee_discount', 'room_fee_discount', 'up_card_fee', 'drinks_price_type', 'room_limit_count', 'market_limit_count', 'can_points', 'can_manual_input', 'can_store_money'],
				'domain': [['active', '=', true]]
			},

			//discount_card_type 打折卡设置
			'ktv.discount_card_type': {
                'model_class' : 'DiscountCardType',
				'fields': ['id', 'name', 'drinks_fee_discount', 'room_fee_discount', 'card_fee'],
				'domain': [['active', '=', true]]
			},

			//song_ticket 欢唱券设置
			'ktv.song_ticket': {
                'model_class' : 'SongTicket',
				'fields': ['id', 'name', 'room_type_id', 'equal_time_limit', 'active_time_limit', 'time_from', 'time_to'],
				'domain': [['active', '=', true]]
			},

			//sales_voucher_type sales_voucher 抵用券设置
			'ktv.sales_voucher_type': {
                'model_class' : 'SalesVoucherType',
				'fields': ['id', 'name', 'face_value'],
			},
			'ktv.sales_voucher': {
                'model_class' : 'SalesVoucher',
                'model_collection_class' : 'SalesVoucherCollection',
				'fields': ['id', 'id_number', 'as_money', 'datetime_from', 'datetime_to', 'state'],
			}
		}

	});

	//全局的ktv_room_pos对象
	var ktv_room_pos = db.ktv_sale.ktv_room_pos = {};

	//模型类
	//包厢
	//一个包厢当前有一个room_operate
	//一个room_operate可有多个包厢相关的操作,比如开房、并房、换房等
	db.ktv_sale.Room = Backbone.Model.extend({
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.bind('change', this.on_change, this);
		},
		//获取room_fee_info
		get_room_fee_info: function() {
			if (!this.room_fee_info) this.room_fee_info = new db.ktv_sale.RoomFeeInfo({
				room: this
			});

			return this.room_fee_info;
		},
		//如果包厢信息发生变化,更新Localstorage中的数据
		on_change: function() {
			var rooms = ktv_room_pos.rooms_all;
			ktv_room_pos.store.set('ktv.room', rooms.export_as_json());
		},
		//获取当前room_operate对象,该对象被包装成
		get_or_create_current_room_operate: function() {
			var cur_room_operate;
			var cur_room_operate_bill_no = this.get('current_room_operate_bill_no');
			if (!cur_room_operate_bill_no) {
				cur_room_operate = new db.ktv_sale.RoomOperate({
					room: this
				});
				this.set({
					current_room_operate_bill_no: cur_room_operate.get("bill_no")
				});
			}
			else cur_room_operate = ktv_room_pos.get_room_operate_b(cur_room_operate_bill_no);
			return cur_room_operate;
		},
		//保存预定信息
		//room_scheduled  预定信息对象
		save_room_scheduled: function(room_scheduled) {
			var self = this;
			var room_states = db.ktv_sale.room_state.array_states_on_operate('room_scheduled');
			if (_.contains(room_states, this.get('state'), this)) {
				var rop = this.get_or_create_current_room_operate();
				rop.get("room_scheduled_lines").add(room_scheduled);
				ktv_room_pos.push_room_operate(rop).always(function() {
					self.set({
						state: 'scheduled'
					});
				});
				return true;
			}
			else return false;
		},
		//保存正常开房信息
		save_room_open: function(room_open) {
			var self = this;
			var room_states = db.ktv_sale.room_state.array_states_on_operate('room_open');
			if (_.contains(room_states, this.get('state'), this)) {
				var rop = this.get_or_create_current_room_operate();
				rop.get("room_open_lines").add(room_open);
				ktv_room_pos.push_room_operate(rop).always(function() {
					self.set({
						state: 'in_use'
					});
				});
				return true;
			}
			else return false;
		},
		//导出为json
		export_as_json: function() {
			var ret = this.toJSON();
			ret.room_fee_info = this.get_room_fee_info().export_as_json();
			ret.state_description = this.state_description();
			return ret;
		},
		//获取state的中文描述
		state_description: function() {
			return db.ktv_sale.room_state.get_state_desc(this.get('state'));
		}
	});

	//包厢费用信息,在开房结账时会使用到包厢的费用信息,
	//费用信息包括包厢费、最低消费、钟点费、会员折扣、买钟优惠等信息,不同种类的包厢,其信息是不同的
	//费用信息也与日期相关,只提取当日有关信息
	db.ktv_sale.RoomFeeInfo = Backbone.Model.extend({
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.set({
				//时段低消设置
				"minimum_fee_config_lines": new Backbone.Collection(),
				//设置包厢时段钟点费
				"all_hourly_fee_discount_lines": new Backbone.Collection(),
				"today_hourly_fee_discount_lines": new Backbone.Collection(),
				//设置会员时段钟点费
				"all_member_hourly_fee_discount_lines": new Backbone.Collection(),
				"today_member_hourly_fee_discount_lines": new Backbone.Collection(),
				//设置按位时段钟点费
				"all_hourly_fee_p_discount_lines": new Backbone.Collection(),
				"today_hourly_fee_p_discount_lines": new Backbone.Collection(),
				//买断设置
				"buyout_config_lines": new Backbone.Collection(),
				//自助餐设置
				"buffet_config_lines": new Backbone.Collection(),
				//设置买钟优惠
				"hourly_fee_promotion_lines": new Backbone.Collection()
			});
			this.bind("change:room", this._on_room_change, this);
			this.bind("change:room_type_id", this._on_room_type_id_change, this);
			this._on_room_change();
		},

		//获取当前可用的买断列表,不包括只对会员有效的买断
		//只有当前时间在买断设定的时间内,买断才可用
		//include_member true 包含会员买断 false 不包含会员买断
		get_active_buyout_config_lines: function(include_member) {
			var lines = this.get("buyout_config_lines");
			var current_time = Date.today().setTimeToNow();
			var active_lines = lines.filter(function(l) {
				//判断时间是否在区间内
				if (include_member) return current_time.between(Date.parse(l.get('time_from')), Date.parse(l.get('time_to')));
				else return ! l.is_member && current_time.between(Date.parse(l.get('time_from')), Date.parse(l.get('time_to')));
			});
			return active_lines;
		},
        //获取当前可用的自助餐设置
        //include_member 是否包含会员设置,默认情况下不包含
		get_active_buffet_config_lines: function(include_member) {
			var lines = this.get("buffet_config_lines");
			var current_time = Date.today().setTimeToNow();
			var active_lines = lines.filter(function(l) {
				//判断时间是否在区间内
				if (include_member) return current_time.between(Date.parse(l.get('time_from')), Date.parse(l.get('time_to')));
				else return ! l.is_member && current_time.between(Date.parse(l.get('time_from')), Date.parse(l.get('time_to')));
			});
			return active_lines;
		},

		//计算相关费用,根据系统设置中的数据计算包厢费、最低消费、按位低消金额
		_get_current_fee: function(which_fee) {
			var current_fee = this.get(which_fee);
			var minimum_lines = this.get("minimum_fee_config_lines");
			var current_time = Date.today().setTimeToNow();
			var match_line = minimum_lines.find(function(l) {
				//判断时间是否在区间内
				return current_time.between(Date.parse(l.get('time_from')), Date.parse(l.get('time_to')));
			});
			if (match_line) current_fee = match_line.get(which_fee);
			return current_fee;
		},
		current_room_fee: function() {
			return this._get_current_fee("room_fee");
		},
		current_minimum_fee: function() {
			return this._get_current_fee("minimum_fee");
		},
		current_minimum_fee_p: function() {
			return this._get_current_fee("minimum_fee_p");
		},
		//导出为Json
		export_as_json: function() {
			ret = {
				room_fee: this.current_room_fee(),
				minimum_fee: this.current_minimum_fee(),
				minimum_fee_p: this.current_minimum_fee_p(),
			};
			//时段钟点费
			ret.hourly_fee_lines = this._export_hourly_fee_lines("hourly_fee_discount");
			ret.hourly_fee_p_lines = this._export_hourly_fee_lines("hourly_fee_p_discount");
			ret.member_hourly_fee_lines = this._export_hourly_fee_lines("member_hourly_fee_discount");
			//买断设置
			var buyout_config_lines = [];
			this.get("buyout_config_lines").each(function(l) {
				buyout_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
					buyout_time: l.get("buyout_time"),
					buyout_fee: l.get("buyout_fee")
				});
			});
			ret.buyout_config_lines = buyout_config_lines;
            //当前可用的买断设置
			var active_buyout_config_lines = [];
			_.each(this.get_active_buyout_config_lines(),function(l) {
				active_buyout_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
                    break_on_active : l.get("break_on_active"),
                    break_on : l.get("break_on"),
					buyout_time: l.get("buyout_time"),
					buyout_fee: l.get("buyout_fee")
				});
			});
			ret.active_buyout_config_lines = active_buyout_config_lines;

			//自助餐设置
			var buffet_config_lines = [];
			this.get("buffet_config_lines").each(function(l) {
				buffet_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
					buyout_time: l.get("buyout_time"),
					buyout_fee: l.get("buyout_fee"),
					child_buyout_fee: l.get("child_buyout_fee")
				});
			});
			ret.buffet_config_lines = buffet_config_lines;

            //当前可用的自助餐设置
			var active_buffet_config_lines = [];
			_.each(this.get_active_buffet_config_lines(),function(l) {
				active_buffet_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
                    break_on_active : l.get("break_on_active"),
                    break_on : l.get("break_on"),
					buyout_time: l.get("buyout_time"),
					buyout_fee: l.get("buyout_fee"),
					child_buyout_fee: l.get("child_buyout_fee")
				});
			});
			ret.active_buffet_config_lines = active_buffet_config_lines;

			//买钟优惠
			var hourly_fee_promotion_lines = [];
			this.get("hourly_fee_promotion_lines").each(function(l) {
				hourly_fee_promotion_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
					buy_minutes: l.get("buy_minutes"),
					present_minutes: l.get("present_minutes")
				});
			});
			ret.hourly_fee_promotion_lines = hourly_fee_promotion_lines;

			return ret;
		},
		//导出钟点费设置
		_export_hourly_fee_lines: function(which_fee) {
			var hourly_fee_lines = [];
			if (this.get("today_" + which_fee + "_lines").length == 0) hourly_fee_lines.push({
				member_class_id: - 1,
				price_class_id: - 1,
				base_hourly_fee: this.get(which_fee),
				"time_range": "00:00 ~ 24:00",
				hourly_fee_discount: "不打折",
				hourly_fee: this.get("hourly_fee")
			});
			else {
				this.get("today_" + which_fee + "_lines").each(function(l) {
					hourly_fee_lines.push({
						member_class_id: l.get("member_class_id"),
						price_class_id: l.get("price_class_id"),
						base_hourly_fee: l.get("base_hourly_fee"),
						"time_range": l.get("time_from") + "~" + l.get("time_to"),
						hourly_fee_discount: l.get("hourly_fee_discount"),
						hourly_fee: l.get("hourly_fee")
					});
				});
			}
			return hourly_fee_lines;
		},
		//包厢发生变化
		_on_room_change: function() {
			var the_room = this.get("room");
			this.set({
				"room_type_id": the_room.get("room_type_id")[0]
			});
		},
		//包厢类别id发生变化
		_on_room_type_id_change: function() {
			var room = this.get("room");
			var room_type_id = this.get("room_type_id");
			//获取room_type完整信息
			var room_types = new Backbone.Collection(ktv_room_pos.store.get('ktv.room_type'));
			var room_type = room_types.get(room_type_id);
			this.set({
				"room_type": room_type
			});
			//设置包厢费
			//如具体包厢的包厢费与包厢分类设置的包厢费不同,则以具体包厢为准
			//如具体包厢的最低消费与包厢分类设置的不同,则以具体包厢为准
			//如该类别包厢有时段低消设置,则以时段低消为准
			var room_fee_type = room_type.get("room_fee");
			var room_fee = room.get("room_fee");
			if (room_fee <= 0) room_fee = room_fee_type;
			//钟点费
			var hourly_fee_type = room_type.get("hourly_fee");
			var hourly_fee = room.get("hourly_fee");
			if (hourly_fee <= 0) hourly_fee = hourly_fee_type;
			//按位钟点费
			var hourly_fee_p_type = room_type.get("hourly_fee_p");
			var hourly_fee_p = room.get("hourly_fee_p");
			if (hourly_fee_p <= 0) hourly_fee_p = hourly_fee_p_type;
			//最低消费
			var minimum_fee_type = room_type.get("minimum_fee");
			var minimum_fee = room.get("minimum_fee");
			if (minimum_fee <= 0) minimum_fee = minimum_fee_type;

			//按位最低消费
			var minimum_fee_p_type = room_type.get("minimum_fee_p");
			var minimum_fee_p = room.get("minimum_fee_p");
			if (minimum_fee_p <= 0) minimum_fee_p = minimum_fee_p_type;

			//按位消费时最低计费人数
			var minimum_persons = room.get("minimum_persons");
			//赠送比例
			var present_rate = room_type.get("present_rate");
			//服务费
			var service_fee = room_type.get("service_fee");
			//设置各项费用
			this.set({
				room_fee: room_fee,
				hourly_fee: hourly_fee,
				hourly_fee_p: hourly_fee_p,
				minimum_fee: minimum_fee,
				minimum_fee_p: minimum_fee_p,
				present_rate: present_rate,
				service_fee: service_fee,
				minimum_persons: minimum_persons
			});
			this._set_minimum_fee();
			this._set_hourly_fee_discount("hourly_fee_discount");
			this._set_hourly_fee_discount("hourly_fee_discount", true);
			this._set_hourly_fee_discount("hourly_fee_p_discount");
			this._set_hourly_fee_discount("hourly_fee_p_discount", true);
			this._set_hourly_fee_discount("member_hourly_fee_discount");
			this._set_hourly_fee_discount("member_hourly_fee_discount", true);

			this._set_buyout_config();
			this._set_buffet_config();
			this._set_hourly_fee_promotion();
		},
		//设置时段低消费用
		//只提取当日相关信息,且该信息active = true
		//若费用存在但是为0,则取包厢设置
		_set_minimum_fee: function() {
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			//先获取特殊日设置
			var minimum_fee_configs = ktv_room_pos.store.get("ktv.minimum_fee_config");
			var minimum_fee_config_special_days = ktv_room_pos.store.get("ktv.minimum_fee_config_special_day");
			//得到当日的特殊日设置
			var sd_config = _.find(minimum_fee_config_special_days, function(c) {
				return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
			});
			//设置周一至周日
			_.each(minimum_fee_configs, function(c) {
				if (c.room_type_id[0] == the_room_type.get("id")) {
					//判断当日是周几
					var today_week_day = db.ktv_sale.util.today_week_day();
					var today_config = {
						time_from: c.time_from,
						time_to: c.time_to,
						room_fee: c[today_week_day + "_room_fee"],
						minimum_fee: c[today_week_day + "_minimum_fee"],
						minimum_fee_p: c[today_week_day + "_minimum_fee_p"]
					};
					//如果当日是特殊日,则用特殊日设置覆盖当日设置
					if (sd_config) {
						today_config.room_fee = c["special_day_room_fee"];
						today_config.minimum_fee = c["special_day_minimum_fee"];
						today_config.minimum_fee_p = c["special_day_minimum_fee_p"];
					}

					this.get("minimum_fee_config_lines").add(today_config);
				}
			},
			this);
		},
		//设置包厢时段钟点费
		//load_all 读取所有设置,默认只读取当日设置
		_set_hourly_fee_discount: function(which_fee, load_all) {
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			//先获取特殊日设置
			var hourly_fee_configs = ktv_room_pos.store.get("ktv." + which_fee);
			var hourly_fee_config_special_days = ktv_room_pos.store.get("ktv." + which_fee + "_special_day");
			//得到当日的特殊日设置
			var sd_config = _.find(hourly_fee_config_special_days, function(c) {
				return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
			});
			//设置周一至周日
			_.each(hourly_fee_configs, function(c) {
				if (c.room_type_id[0] == the_room_type.get("id")) {
					//判断当日是周几
					var today_week_day = db.ktv_sale.util.today_week_day();
					var today_config = {
						price_class_id: c["price_class_id"][0],
						base_hourly_fee: c.base_hourly_fee,
						time_from: c.time_from,
						time_to: c.time_to,
						hourly_fee: c[today_week_day + "_hourly_fee"],
						hourly_fee_discount: c[today_week_day + "_hourly_discount"]
					};
					if (c.member_class_id) today_config.member_class_id = c.member_class_id[0];
					//如果当日是特殊日,则用特殊日设置覆盖当日设置
					if (sd_config) {
						today_config.hourly_fee = c["special_day_hourly_fee"];
						today_config.hourly_discount = c["special_day_hourly_discount"];
					}
					if (load_all) {
						today_config = c;
						this.get("all_" + which_fee + "_lines").add(today_config);
					}
					else this.get("today_" + which_fee + "_lines").add(today_config);
				}
			},
			this);
		},
		//设置买断信息
		_set_buyout_config: function() {
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			//先获取特殊日设置
			var buyout_configs = ktv_room_pos.store.get("ktv.buyout_config");
			var buyout_config_special_days = ktv_room_pos.store.get("ktv.buyout_config_special_day");
			//得到当日的特殊日设置
			var sd_config = _.find(buyout_config_special_days, function(c) {
				return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
			});
			//设置周一至周日
			_.each(buyout_configs, function(c) {
				if (c.room_type_id[0] == the_room_type.get("id")) {
					//判断当日是周几
					var today_week_day = db.ktv_sale.util.today_week_day();
					var today_config;
					if (c[today_week_day + "_buyout_enable"]) today_config = {
						name: c["name"],
						is_member: c["is_member"],
						time_from: c.time_from,
						time_to: c.time_to,
						break_on_enable: c["break_on_enable"],
						break_on: c["break_on"],
						buyout_time: c["buyout_time"],
						buyout_fee: c[today_week_day + "_buyout_fee"]
					};
					//如果当日是特殊日,则用特殊日设置覆盖当日设置
					if (sd_config) {
						today_config.buyout_fee = c["special_day_buyout_fee"];
					}
					if (today_config) this.get("buyout_config_lines").add(today_config);
				}
			},
			this);
		},
		//设置自助餐买断信息
		_set_buffet_config: function() {
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			//先获取特殊日设置
			var buffet_configs = ktv_room_pos.store.get("ktv.buffet_config");
			var buffet_config_special_days = ktv_room_pos.store.get("ktv.buffet_config_special_day");
			//得到当日的特殊日设置
			var sd_config = _.find(buffet_config_special_days, function(c) {
				return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
			});
			//设置周一至周日
			_.each(buffet_configs, function(c) {
				if (c.room_type_id[0] == the_room_type.get("id")) {
					//判断当日是周几
					var today_week_day = db.ktv_sale.util.today_week_day();
					var today_config;
					if (c[today_week_day + "_buyout_enable"]) today_config = {
						name: c["name"],
						is_member: c["is_member"],
						time_from: c.time_from,
						time_to: c.time_to,
						break_on_enable: c["break_on_enable"],
						break_on: c["break_on"],
						buyout_time: c["buyout_time"],
						buyout_fee: c[today_week_day + "_buyout_fee"],
						child_buyout_fee: c[today_week_day + "_child_buyout_fee"]
					};
					//如果当日是特殊日,则用特殊日设置覆盖当日设置
					if (sd_config) {
						today_config.buyout_fee = c["special_day_buyout_fee"];
						today_config.child_buyout_fee = c["special_day_child_buyout_fee"];
					}
					if (today_config) this.get("buffet_config_lines").add(today_config);
				}
			},
			this);
		},
		//设置买钟优惠
		_set_hourly_fee_promotion: function() {
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today().setTimeToNow();
			var hourly_fee_promotions = ktv_room_pos.store.get("ktv.hourly_fee_promotion");
			//设置周一至周日
			_.each(hourly_fee_promotions, function(c) {
				var today_config;
				//首先,假定所有优惠设置都生效
				today_config = {
					name: c["name"],
					is_member: c["is_member"],
					buy_minutes: c.buy_minutes,
					present_minutes: c.present_minutes,
					active_time_limit: c.active_limit,
					time_from: c.time_from,
					time_to: c.time_to,
					active_break_on_time: c.active_break_on_time,
					break_on_time: c.break_on_time

				};
				//判断是否启用时间段设置
				//如果启用了时间区间限制并且当前日期不在时间区间内,则该优惠不起效
				var datetime_from = Date.parse(c.datetime_from);
				var datetime_to = Date.parse(c.datetime_to);
				var time_from = Date.parse(c.time_from);
				var time_to = Date.parse(c.time_to);

				if (c.active_datetime_limit && ! today.between(datetime_from, datetime_to)) today_config = null;
				if (c.active_time_limit && ! today.between(time_from, time_to)) today_config = null;
				//判断是否启用了星期设置,任意一项选择,则表示启用了该设置
				if (c.mon_active || c.tue_active || c.wed_active || c.thu_active || c.fri_active || c.sat_active || c.sun_active) {
					var today_week_day = db.ktv_sale.util.today_week_day();
					if (!c[today_week_day + "_active"]) today_config = null;
				}
				if (today_config) this.get("hourly_fee_promotion_lines").add(today_config);
			},
			this);
		}
	});

	db.ktv_sale.RoomCollection = Backbone.Collection.extend({
		model: db.ktv_sale.Room,
		//导出为json
		export_as_json: function() {
			return this.map(function(r) {
				return r.export_as_json();
			});
		}
	});

	//ktv_shop
	//一个ktv_shop代表当前的一个收银柜台
	//一个ktv_shop可有多个room
	db.ktv_sale.KtvShop = Backbone.Model.extend({
		initialize: function() {
			this.set({
				rooms: new db.ktv_sale.RoomCollection(),
				//房态统计
				room_status: {}
			});
			//this.bind('change:rooms',this._update_room_status,this);
			this.get('rooms').bind('change', this._update_room_status, this);
			this.get('rooms').bind('reset', this._update_room_status, this);
		},
		//更新房态
		_update_room_status: function() {
			var rooms = this.get('rooms');
			var room_status = {};
			_.each(db.ktv_sale.room_state.key_states, function(s) {
				var state_rooms = rooms.filter(function(r) {
					return r.get("state") == s
				});
				room_status[s] = state_rooms.length;
			});
			this.set({
				'room_status': room_status
			});
		}
	});

	//包厢操作类
	//一个包厢操作可包含开房、换房、并房、结账、买钟、买断、续钟、退钟、结账等操作
	//
	db.ktv_sale.RoomOperate = Backbone.Model.extend({
		defaults: {
			//room: null,
			//是否已保存到数据库
			saved: false,
			//用于标示是否已和服务器同步
			validated: false,
			operate_date: new Date(),
		},
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.set({
				bill_no: "R" + this.generateUniqueId(),
				//room: new db.ktv_sale.Room(),
				//包厢预定-操作列表
				room_scheduled_lines: new db.ktv_sale.RoomScheduledCollection(),
				//TODO 取消预定列表
				//开房列表
				room_open_lines: new db.ktv_sale.RoomOpenCollection()
				//其他操作列表
			});
			if (attributes.room) this.set({
				room: new db.ktv_sale.Room(attributes.room)
			});
		},
		generateUniqueId: function() {
			return new Date().getTime();
		},
		//导出为json
		export_as_json: function() {
			var ret = {
				bill_no: this.get('bill_no'),
				room: this.get('room').export_as_json()
			}
			room_scheduled_lines = [];
			this.get('room_scheduled_lines').each(function(line) {
				room_scheduled_lines.push(line.toJSON());
			},
			this);
			ret['room_scheduled_lines'] = room_scheduled_lines;
			room_open_lines = [];
			this.get('room_open_lines').each(function(line) {
				room_open_lines.push(line.toJSON());
			},
			this);
			ret['room_open_lines'] = room_open_lines;
			return ret;
		}
	});

	//RoomOperateCollection
	db.ktv_sale.RoomOperateCollection = Backbone.Collection.extend({
		model: db.ktv_sale.RoomOperate,
		//导出为json
		export_as_json: function() {
			return this.map(function(op) {
				return op.export_as_json();
			});
		}
	});

	//预定信息
	db.ktv_sale.RoomScheduled = Backbone.Model.extend({
		defaults: {
			scheduled_time: new Date()
		}
	});

	//预定信息列表
	db.ktv_sale.RoomScheduledCollection = Backbone.Collection.extend({
		model: db.ktv_sale.RoomScheduled
	});
	//预定widget
	db.ktv_sale.RoomScheduledWidget = db.web.BootstrapModal.extend({
		template_fct: qweb_template('room-scheduled-form-template'),
		init: function(parent, options) {
			this.room = options.room;
			this.model = new db.ktv_sale.RoomScheduled();
			this._super(parent, options);
		},
		start: function() {
			this.$form = $(this.$element).find("#room_scheduled_form");
			this.$form.find('#scheduled_time').datetimepicker();
			this.$form.find('#scheduled_time').val(this.model.get('scheculed_time'));
			//包厢改变事件
			this.$form.find("#room_id").change(_.bind(this.on_change_room, this));
			//设置初始值
			if (this.room) this.$form.find('#room_id').val(this.room.id);
			//保存事件
			this.$element.find(".btn-save").click(_.bind(this.save, this));
			return this;
		},
		render_element: function() {
			this.$element.html(this.template_fct({
				rooms: ktv_room_pos.get_rooms_by_state('free').export_as_json(),
				model: this.model.toJSON()
			}));
			return this;
		},
		//修改包厢
		on_change_room: function() {
			var changed_room = ktv_room_pos.rooms_all.get(this.$form.find('#room_id').val());
			this.room = changed_room;
		},
		//验证录入数据是否有效
		validate: function() {
			return this.$form.validate().form();
		},
		//保存预定信息
		save: function() {
			if (!this.validate()) {
				return false;
			}
			//自界面获取各项值
			this.model.set(this.$form.form2json());
			if (this.room.save_room_scheduled(this.model)) this.close();
		}
	});

	//正常开房信息
	db.ktv_sale.RoomOpen = Backbone.Model.extend({
		defaults: {
			open_date: new Date(),
			//开房时间
			prepay_fee: 0.0,
			//预付款项
			persons_count: 3 //默认人数为
		},
		export_as_json: function() {
			return this.toJSON();
		}
	});
	//正常开房信息列表
	db.ktv_sale.RoomOpenCollection = Backbone.Collection.extend({
		model: db.ktv_sale.RoomOpen
	});
	//开房widget
	db.ktv_sale.RoomOpenWidget = db.web.BootstrapModal.extend({
		template_fct: qweb_template("room-open-template"),
		init: function(parent, options) {
			this.room = options.room;
			this.model = new db.ktv_sale.RoomOpen();
			this._super(parent, options);
		},
		start: function() {
			this.$form = this.$element.find("form");
			//绑定room_id变化事件
			this.$form.find("#room_id").change(_.bind(this.on_change_room_id, this));
			//绑定价格类型价格变化
			this.$form.find("#fee_type_id").change(_.bind(this.on_change_fee_type_id, this));
			//绑定计费方式价格变化
			this.$form.find("#price_class_id").change(_.bind(this.on_change_price_class_id, this));
			this.$element.find('.btn-save-room-open').click(_.bind(this.on_btn_save, this));
			//设置初始值
			if (this.room) this.$form.find('#room_id').val(this.room.id);
			this.on_change_price_class_id();
		},
		render_element: function() {
			this.$element.html(this.template_fct({
				//空闲、已预定、已结账、清洁的房间都可以开房
				rooms: ktv_room_pos.get_rooms_by_state(['free', 'scheduled', 'checkout', 'clean']).export_as_json(),
				model: this.model.export_as_json(),
				room: this.room.export_as_json()
			}));
			return this;
		},
		//包厢信息发生变化时,需要重新显示界面
		on_change_room_id: function() {
			var changed_room = ktv_room_pos.rooms_all.get(this.$form.find('#room_id').val());
			this.room = changed_room;
			this.close();
			this.open();
		},
		on_change_fee_type_id: function() {
			var fee_types = ktv_room_pos.store.get("ktv.fee_type");
			var fee_type = _.find(fee_types, function(f) {
				return f.id == this.$form.find('#fee_type_id').val();
			},
			this);
			this.$element.find(".room_fee,.minimum_fee,.minimum_fee_p,.buyout_fieldset,.buffet_fieldset,.buyout_config_lines,.buffet_config_lines,.buytime_fieldset,.hourly_fee_promotion_lines,.hourly_fee_lines,.member_hourly_fee_lines,.hourly_fee_p_lines").hide();
			//只收包厢费
			if (fee_type.fee_type_code == "only_room_fee") {
				this.$element.find(".room_fee").show();
			}
			//只收钟点费
			if (fee_type.fee_type_code == "only_hourly_fee") {
				this.$element.find(".hourly_fee,.hourly_fee_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}

			//钟点费+包厢费
			if (fee_type.fee_type_code == "room_fee_plus_hourly_fee") {
				this.$element.find(".room_fee,.hourly_fee,.hourly_fee_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}
			//最低消费
			if (fee_type.fee_type_code == "minimum_fee") {
				this.$element.find(".minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}

			//包厢费+最低消费
			if (fee_type.fee_type_code == "room_fee_plus_minimum_fee") {
				this.$element.find(".room_fee,.minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}

			//钟点费+最低消费
			if (fee_type.fee_type_code == "hourly_fee_plus_minimum_fee") {
				this.$element.find(".hourly_fee_lines,.minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}

			//包厢费+钟点费+最低消费
			if (fee_type.fee_type_code == "room_fee_plus_hourly_fee_plus_minimum_fee") {
				this.$element.find(".room_fee,.hourly_fee,.hourly_fee_lines,.minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}
			//按位钟点费
			if (fee_type.fee_type_code == "hourly_fee_p") {
				this.$element.find(".hourly_fee_p_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
			}

			//按位最低消费
			if (fee_type.fee_type_code == "minimum_fee_p") {
				this.$element.find(".minimum_fee_p").show();
			}
            //买断
            if(fee_type.fee_type_code == "buyout_fee"){
                this.$element.find(".buyout_config_lines,.buyout_fieldset").show();
                this.$element.find(".buytime_fieldset").hide();
            }
			//自助餐
            if(fee_type.fee_type_code == "buffet"){
                this.$element.find(".buffet_config_lines,.buffet_fieldset").show();
                this.$element.find(".buytime_fieldset").hide();
            }
			//酒水费
			//TODO
		},
		on_change_price_class_id: function() {
			var price_class_id = this.$form.find("#price_class_id").val();
			var match_els = this.$element.find('tr[data-price-class-id="' + price_class_id + '"]');
			if (match_els.length > 0) {
				//只显示当前价格类型相关的钟点折扣信息
				this.$element.find('tr[data-price-class-id]').hide();
				this.$element.find('tr[data-price-class-id="' + price_class_id + '"]').show();
			}
			this.on_change_fee_type_id();
		},
		//保存开房信息
		on_btn_save: function() {
			if (!this.$form.validate()) {
				return false;
			}
			//自界面获取各项值
			this.model.set(this.$form.form2json());
			if (this.room.save_room_open(this.model)) this.close();
		}

	});

	//包厢过滤 widget
	db.ktv_sale.RoomFilterWidget = db.web.OldWidget.extend({
		template_fct: qweb_template('room-filter'),
		init: function(parent, options) {
			this._super(parent);
			this.ktv_shop = options.ktv_shop;
		},
		start: function() {
			//绑定按钮点击事件
			$('.btn-room-type-filter,.btn-room-area-filter,.btn-room-state-filter').click(_.bind(this._filter_room, this));
		},
		//根据前端的操作过滤包厢的显示
		_filter_room: function(evt) {
			var click_btn = $(evt.target);
			var btn_class = "";
			if (click_btn.hasClass('btn-room-type-filter')) btn_class = ".btn-room-type-filter";
			if (click_btn.hasClass('btn-room-state-filter')) btn_class = ".btn-room-state-filter";
			if (click_btn.hasClass('btn-room-area-filter')) btn_class = ".btn-room-area-filter";

			$(btn_class).removeClass('active')
			if (!click_btn.hasClass('active')) click_btn.addClass('active');
			var room_state = $('.btn-room-state-filter').filter('.active').data('room-state');
			var room_area_id = $('.btn-room-area-filter').filter('.active').data('room-area-id');
			var room_type_id = $('.btn-room-type-filter').filter('.active').data('room-type-id');
			//所有房间
			var rooms = ktv_room_pos.store.get('ktv.room');
			var filtered_rooms = rooms;
			if (room_state != - 1) filtered_rooms = _.filter(rooms, function(r) {
				return r.state == room_state;
			});
			if (room_type_id != - 1) filtered_rooms = _.filter(filtered_rooms, function(r) {
				return r.room_type_id[0] == room_type_id;
			});
			if (room_area_id != - 1) filtered_rooms = _.filter(filtered_rooms, function(r) {
				return r.room_area_id[0] == room_area_id;
			});

			this.ktv_shop.get('rooms').reset(filtered_rooms);
		},

		render_element: function() {
			this.$element.html(this.template_fct({}));
			return this;
		}
	});

	//ShopWidget
	db.ktv_sale.KtvShopWidget = db.web.OldWidget.extend({
		init: function(parent, options) {
			this._super(parent);
			this.ktv_shop = options.ktv_shop;
		},
		start: function() {
			this.room_list_view = new db.ktv_sale.RoomListWidget(null, {
				ktv_shop: this.ktv_shop
			});
			this.room_list_view.$element = $('#room_list');
			this.room_list_view.render_element();
			this.room_list_view.start();

			this.room_status_view = new db.ktv_sale.RoomStatusWidget(null, {
				ktv_shop: this.ktv_shop
			});
			this.room_status_view.$element = $('#room_status');
			this.room_status_view.render_element();
			this.room_status_view.start();

			//room filter
			this.room_filter_view = new db.ktv_sale.RoomFilterWidget(null, {
				ktv_shop: this.ktv_shop
			});
			this.room_filter_view.$element = $('#room_filter');
			this.room_filter_view.render_element();
			this.room_filter_view.start();

		}
	});
	//roomWidget
	db.ktv_sale.RoomWidget = db.web.OldWidget.extend({
		tag_name: 'li',
		template_fct: qweb_template('room-template'),
		init: function(parent, options) {
			this._super(parent);
			this.model = options.model;
			this.ktv_shop = options.ktv_shop;
		},
		start: function() {
			this.model.bind('change:state', _.bind(this.refresh, this));
			$(this.$element).find('.action_room_scheduled').click(_.bind(this.action_room_scheduled, this));
			$(this.$element).find('.action_room_open').click(_.bind(this.action_room_open, this));
		},
		refresh: function() {
			this.render_element();
			//触发ktv_shop的的变化
		},
		render_element: function() {
			this.$element.empty();
			this.$element.html(this.template_fct(this.model.export_as_json()));
			var states = db.ktv_sale.room_state.states;
			//设置当前room可用的action
			if (this.model.get('state') == states.FREE[0]) $(this.$element).find('.action_room_scheduled_cancel,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == states.SCHEDULED[0]) $(this.$element).find('.action_room_scheduled,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');

			if (this.model.get('state') == states.IN_USE[0]) $(this.$element).find('.action_room_scheduled,.action_scheduled_cancel,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == states.LOCKED[0] || this.model.get('state') == states.MALFUNCTION[0] || this.model.get('state') == states.DEBUG[0] || this.model.get('state') == states.CLEAN[0]) $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == states.BUYOUT[0]) $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout').parent('li').addClass('disabled');

			if (this.model.get('state') == db.ktv_sale.room_state.states.BUYTIME[0]) $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_checkout').parent('li').addClass('disabled');
			return this;
		},
		//显示预定窗口
		action_room_scheduled: function() {
			var rs_dialog = new db.ktv_sale.RoomScheduledWidget(null, {
				width: 500,
				room: this.model
			});
			//rs_dialog.render_element();
			//rs_dialog.start();
			/*
			var options = {
				title: "预定",
				buttons: {
					"保存预定信息": function() {
						rs_dialog.save();
					},
					"取消": function() {
						rs_dialog.$element.dialog('close');
					}
				}
			};
			new db.web.Dialog(null, options, rs_dialog.$element).open();
			//rs_dialog.appendTo($('body'));
			//rs_dialog.$element.find('#room_scheduled_modal').modal({
				show: false
			}).modal("show").on('hidden', function() {
				rs_dialog.stop()
			});
            */

		},
		//显示开房窗口
		action_room_open: function() {
			var room_open_dialog = new db.ktv_sale.RoomOpenWidget(null, {
				room: this.model
			});
		},

		//设置当前选中的包厢
		select_room: function(evt) {
			evt.preventDefault();
			this.ktv_shop.set({
				current_room: this.model
			});
		}
	});
	//房间列表
	db.ktv_sale.RoomListWidget = db.web.OldWidget.extend({
		init: function(parent, options) {
			this._super(parent);
			this.ktv_shop = options.ktv_shop;
			//房间数据变化时激发重绘列表
			this.ktv_shop.get('rooms').bind('reset', this.render_element, this);
		},
		render_element: function() {
			this.$element.empty();
			this.ktv_shop.get('rooms').each(_.bind(function(r) {
				var r_widget = new db.ktv_sale.RoomWidget(null, {
					model: r
				});
				r_widget.appendTo(this.$element);
			},
			this), this);
			return this;
		}
	});
	//房态统计
	db.ktv_sale.RoomStatusWidget = db.web.OldWidget.extend({
		template_fct: qweb_template('room-status-template'),
		init: function(parent, options) {
			this._super(parent);
			this.ktv_shop = options.ktv_shop;
		},
		start: function() {
			//ktv_shop中的包厢数据发生变化时,重绘房态组件
			this.ktv_shop.bind('change:room_status', this.render_element, this);
		},
		render_element: function() {
			this.$element.empty();
			this.$element.html(this.template_fct(this.ktv_shop.get('room_status')));
			return this;
		}
	});

	//App,初始化各种widget,并定义widget之间的交互
	db.ktv_sale.App = (function() {
		function App($element) {
			this.initialize($element);
		}

		App.prototype.initialize = function($element) {
			this.ktv_shop = new db.ktv_sale.KtvShop();
			this.ktv_shop_view = new db.ktv_sale.KtvShopWidget(null, {
				ktv_shop: this.ktv_shop
			});
			this.ktv_shop_view.$element = $element;
			this.ktv_shop_view.start();
			var rooms = ktv_room_pos.store.get('ktv.room');
			(this.ktv_shop.get('rooms')).reset(rooms);

		};
		return App;
	})();

	//openerp的入口组件,用于定义系统的初始入口处理
	db.web.client_actions.add('ktv_room_pos.ui', 'db.ktv_sale.RoomPointOfSale');
	db.ktv_sale.RoomPointOfSale = db.web.OldWidget.extend({
		init: function() {
			this._super.apply(this, arguments);
			if (ktv_room_pos['session']) throw "It is not possible to instantiate multiple instances " + "of the point of sale at the same time.";
			ktv_room_pos = new db.ktv_sale.KtvRoomPos(this.session);
		},
		start: function() {
			ktv_room_pos.app = new db.ktv_sale.App(self.$element);
			$('oe_toggle_secondary_menu').hide();
			$('#oe_secondary_menu').hide();
			$('.header').hide();
			$('.menu').hide();
			$('.oe_footer').hide();
		},
		render: function() {
			return qweb_template("RoomPointOfSale")();
		}
	});
};

