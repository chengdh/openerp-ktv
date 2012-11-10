//定义ktv开房pos界面
openerp.ktv_sale = function(db) {
	db.ktv_sale = {};

	var QWeb = db.web.qweb;
	var qweb_template = function(template) {
		return function(ctx) {
			return QWeb.render(template, _.extend({},
			ctx, {
				//以下定义需要在界面上显示的数据
				'room_types': ktv_room_pos.store.get('ktv.room_type'),
				'room_areas': ktv_room_pos.store.get('ktv.room_area'),
				'fee_types': ktv_room_pos.store.get('ktv.fee_type'),
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
				func_fetch_array.push(this.fetch(attr, this.osv_objects[attr]['fields'], this.osv_objects[attr]['domain']));
			}
			$.when.apply(this, func_fetch_array);
		},
		//根据包厢状态货物包厢信息
		get_rooms_by_state: function(r_state) {
			var rooms_all = this.store.get('ktv.room');
			var rooms_filted = rooms_all;
			if (r_state) var rooms_filted = _.filter(rooms_all, function(r) {
				return r.state == r_state
			});
			return rooms_filted;

		},
		//自服务器端获取数据,并保存到browser的localstorage中去
		fetch: function(osvModel, fields, domain) {
			var dataSetSearch;
			var self = this;

			dataSetSearch = new db.web.DataSetSearch(this, osvModel, {},
			domain);
			return dataSetSearch.read_slice(fields, 0).then(function(result) {
				return self.store.set(osvModel, result);
			});
		},

		push_room_operate: function(record) {
			var ops = _.clone(this.get('pending_operations'));
			ops.push(record);
			this.set({
				pending_operations: ops
			});
			return this.flush();
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
				'fields': ['id', 'name'],
				'domain': []
			},
			//fee_type_member_class_discount //计费方式-会员折扣信息
			'ktv.fee_type_member_class_discount': {
				'fields': ['fee_type_id', 'memeber_class_id', 'drinks_fee_discount', 'room_fee_discount'],
				'domain': []
			},
			//pay_type //付款方式
			'ktv.pay_type': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//room_area //包厢区域
			'ktv.room_area': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//room_type  //包厢类别
			'ktv.room_type': {
				'fields': ['id', 'name', 'drinks_price_type', 'fee_type_id', 'serve_persons', 'room_fee', 'hourly_fee', 'hourly_fee_p', 'minimum_fee', 'minimum_fee_p', 'service_fee', 'present_rate'],
				'domain': []
			},
			//room      //包厢信息
			'ktv.room': {
				'fields': ['id', 'name', 'room_area_id', 'room_type_id', 'fee_type_id', 'ktv_box_ip', 'room_fee', 'hourly_fee', 'minimum_fee', 'hourly_fee_p', 'minimum_fee_p', 'minimum_persons', 'sequence', 'state'],
				'domain': []
			},
			//buyout_config //买断设置
			'ktv.buyout_config': {
				'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'thurs_buyout_enable', 'thurs_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'special_day_buyout_fee'],
				'domain': []
			},
			//buyout_config_special_day //买断特殊日设置
			'ktv.buyout_config_special_day': {
				'fields': ['room_type_id', 'special_day'],
			},

			//buffet_config buffet_config_special_day 自助餐设置
			'ktv.buffet_config': {
				'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'mon_child_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'tue_child_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'wed_child_buyout_fee', 'thurs_buyout_enable', 'thurs_buyout_fee', 'thurs_child_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'fri_child_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sat_child_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'sun_child_buyout_fee', 'special_day_buyout_fee', 'special_day_child_buyout_fee'],
				'domain': []
			},
			'ktv.buffet_config_special_day': {
				'fields': ['room_type_id', 'special_day'],
			},

			//minimum_fee_config minimum_fee_config_special_day时段低消设置
			'ktv.minimum_fee_config': {
				'fields': ['room_type_id', 'time_from', 'time_to', 'mon_minimum_fee', 'mon_minimum_fee_p', 'mon_room_fee', 'tue_minimum_fee', 'tue_minimum_fee_p', 'tue_room_fee', 'wed_minimum_fee', 'wed_minimum_fee_p', 'wed_room_fee', 'thurs_minimum_fee', 'thurs_minimum_fee_p', 'thurs_room_fee', 'fri_minimum_fee', 'fri_minimum_fee_p', 'fri_room_fee', 'sat_minimum_fee', 'sat_minimum_fee_p', 'sat_room_fee', 'sun_minimum_fee', 'sun_minimum_fee_p', 'sun_room_fee', 'special_day_minimum_fee', 'special_day_minimum_fee_p', 'special_day_room_fee'],
				'domain': [['active', '=', true]]
			},
			'ktv.minimum_fee_config_special_day': {
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			//price_class 价格类型
			'ktv.price_class': {
				'fields': ['id', 'name', 'sequence'],
				'domain': [['active', '=', true]]
			},

			//hourly_fee_discount hourly_fee_p_discount member_hourly_fee_discount 时段钟点费设置
			'ktv.hourly_fee_discount': {
				'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thurs_hourly_fee', 'thurs_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.hourly_fee_discount_special_day': {
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount': {
				'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thurs_hourly_fee', 'thurs_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount_special_day': {
				'fields': ['room_type_id', 'special_day'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount': {
				'fields': ['id', 'price_class_id', 'member_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thurs_hourly_fee', 'thurs_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount_special_day': {
				'fields': ['room_type_id', 'member_class_id', 'special_day'],
				'domain': []
			},

			//hourly_fee_promotion 买钟优惠设置
			'ktv.hourly_fee_promotion': {
				'fields': ['id', 'name', 'is_member', 'buy_minutes', 'present_minutes', 'active_datetime_limit', 'datetime_from', 'datetime_to', 'active_time_limit', 'time_from', 'time_to', 'mon_active', 'tue_active', 'wed_active', 'thurs_active', 'fri_active', 'sat_active', 'sun_active'],
				'domain': []
			},
			//member_class会员卡等级设置
			'ktv.member_class': {
				'fields': ['id', 'name', 'card_fee', 'drinks_fee_discount', 'room_fee_discount', 'up_card_fee', 'drinks_price_type', 'room_limit_count', 'market_limit_count', 'can_points', 'can_manual_input', 'can_store_money'],
				'domain': [['active', '=', true]]
			},

			//discount_card_type 打折卡设置
			'ktv.discount_card_type': {
				'fields': ['id', 'name', 'drinks_fee_discount', 'room_fee_discount', 'card_fee'],
				'domain': [['active', '=', true]]
			},

			//song_ticket 欢唱券设置
			'ktv.song_ticket': {
				'fields': ['id', 'name', 'room_type_id', 'equal_time_limit', 'active_time_limit', 'time_from', 'time_to'],
				'domain': [['active', '=', true]]
			},

			//sales_voucher_type sales_voucher 抵用券设置
			'ktv.sales_voucher_type': {
				'fields': ['id', 'name', 'face_value'],
			},
			'ktv.sales_voucher': {
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
		//如果包厢信息发生变化,更新Localstorage中的数据
		on_change: function() {
			var rooms = _.clone(ktv_room_pos.store.get('ktv.room'));
			var changed_room = _.find(rooms, function(r) {
				return r.id == this.get('id')
			},
			this);
			if (changed_room) rooms = _.without(rooms, changed_room);
			rooms.push(this.export_as_json());
			ktv_room_pos.store.set('ktv.room', rooms);
		},
		//导出为json
		export_as_json: function() {
			var ret = this.toJSON();
			if (this.get('current_operate')) {
				ret.current_operate = this.get('current_operate').export_as_json();
			}
			ret.state_description = this.state_description();
			return ret;
		},
		//获取state的中文描述
		state_description: function() {

			//var states = ['free', 'in_use', 'scheduled', 'locked', 'checkout', 'buyout', 'malfunction', 'visit', 'clean', 'debug'];
			var state_description = {
				"free": "空闲",
				"in_use ": "使用中",
				"scheduled": "已预定",
				"locked": "锁定",
				"checkout": "已结账",
				"buyout": "买断",
				"buytime ": "买钟",
				"malfunction ": "故障",
				"visit ": "带客看房",
				"clean ": "清洁中",
				"debug ": "调试中"
			};
			return state_description[this.get('state')];
		}

	});

	db.ktv_sale.RoomCollection = Backbone.Collection.extend({
		model: db.ktv_sale.Room
	});

	//ktv_shop
	//一个ktv_shop代表当前的一个收银柜台
	//一个ktv_shop可有多个room
	db.ktv_sale.KtvShop = Backbone.Model.extend({
		initialize: function() {
			this.set({
				rooms: new db.ktv_sale.RoomCollection(),
				//房态统计
				room_status: {},
				current_room: null
			});
			this.get('rooms').bind('change', this.update_room_status, this);
			this.get('rooms').bind('reset', _.bind(this.update_room_status, this));
		},
		//更新房态
		update_room_status: function() {
			var rooms = this.get('rooms');
			var states = ['free', 'in_use', 'scheduled', 'locked', 'checkout', 'buyout', 'malfunction', 'visit', 'clean', 'debug'];
			var room_status = {};
			_.each(states, function(s) {
				state_rooms = _.filter(rooms.toJSON(), function(r) {
					return r.state == s
				},
				this);
				room_status[s] = state_rooms.length;
			},
			this);
			this.set({
				'room_status': room_status
			});
		}
	});

	//包厢操作类
	//一个包厢操作可包含开房、换房、并房、结账、买钟、买断、续钟、退钟、结账等操作
	db.ktv_sale.RoomOperate = Backbone.Model.extend({
		defaults: {
			//当前操作的包厢
			room: null,
			//是否已验证通过,并上传到服务器端了
			saved: false,
			//FIXME 由于还包含各种子操作,当子操作发生变化时validated会修改为false,表明子操作还未和服务器同步
			validated: false

		},
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.set({
				//各种子操作信息
				operate_lines: new Backbone.Collection(),
				bill_no: "R" + this.generateUniqueId(),
			});
			this.bind('change:operate_lines', function() {
				this.validated = false;
			},
			this);
		},
		generateUniqueId: function() {
			return new Date().getTime();
		},
		//添加操作
		add_operate: function(operate) {
			this.get('operate_lines').add(operate);
		},
		//导出为json
		export_as_json: function() {
			var ret = {
				bill_no: this.get('bill_no'),
				room_id: this.get('room').get('id')
			}
			lines = [];
			this.get('operate_lines').each(function(op) {
				lines.push(op.toJSON());
			},
			this);
			ret['operate_lines'] = lines;
			return ret;
		}
	});

	//预定信息
	db.ktv_sale.RoomScheduled = Backbone.Model.extend({
		defaults: {
			scheduled_time: new Date()
		}
	});

	//预定widget
	db.ktv_sale.RoomScheduledWidget = db.web.OldWidget.extend({
		template_fct: qweb_template('room-scheduled-form-template'),
		init: function(parent, options) {
			this._super(parent, options);
			this.room = options.room;
			this.model = new db.ktv_sale.RoomScheduled();
		},
		start: function() {
            this.$form = $(this.$element).find("#room_scheduled_form");
			this.$form.find('#scheduled_time').datetimepicker();
			//包厢改变事件
			this.$form.find("#room_id").change(_.bind(this.on_change_room, this));
			//设置初始值
			if (this.room) this.$form.find('#room_id').val(this.room.id);
		},
		render_element: function() {
			this.$element.html(this.template_fct({
				rooms: ktv_room_pos.get_rooms_by_state('free'),
				model: this.model
			}));
			return this;
		},
		//修改包厢
		on_change_room: function() {
			var rooms = db.ktv_sale.get_rooms_by_state();
			changed_room = _.find(rooms, function(r) {
				return r.id == this.$form.find('#room_id').val()
			});
			this.room = changed_room;
		},
        //验证录入数据是否有效
        validate :function()
        {

			return this.$form.validate().form();
        },
		//保存预定信息
		save: function() {
			if(!this.validate())
            {
                return false;
            }
			var self = this;
			var room_operate = this.room.current_operate;
			if (!this.room.current_operate) {
				room_operate = new db.ktv_sale.RoomOperate({
					room: this.room
				});
				this.room.set({
					current_operate: room_operate
				});
			}
			//自界面获取各项值
			this.model.set(this.$form.form2json());
			room_operate.add_operate(this.model);
			ktv_room_pos.push_room_operate(room_operate.export_as_json()).always(function() {
				self.room.set({
					state: 'scheduled'
				});
                self.$element.dialog('close');
			});
		}
	});

	//显示widget
	//包厢过滤 widget
	db.ktv_sale.RoomFilterWidget = db.web.OldWidget.extend({
		template_fct: qweb_template('room-filter'),
		init: function(parent, options) {
			this._super(parent);
			this.ktv_shop = options.ktv_shop;
		},
		start: function() {},
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
		},
		refresh: function() {
			this.render_element();
			//触发ktv_shop的的变化
		},
		render_element: function() {
			this.$element.empty();
			this.$element.html(this.template_fct(this.model.export_as_json()));
			//设置当前room可用的action
			if (this.model.get('state') == 'free') $(this.$element).find('.action_room_scheduled_cancel,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == 'scheduled') $(this.$element).find('.action_room_scheduled,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');

			if (this.model.get('state') == 'in_use') $(this.$element).find('.action_room_scheduled,.action_scheduled_cancel,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == 'locked' || this.model.get('state') == 'malfunction' || this.model.get('state') == 'debug' || this.model.get('state') == 'clean') $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout,.action_room_reopen').parent('li').addClass('disabled');
			if (this.model.get('state') == 'buyout') $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_change,.action_room_merge,.action_room_buy_time_continue,.action_room_buy_time_back,.action_room_checkout').parent('li').addClass('disabled');

			if (this.model.get('state') == 'buytime') $(this.$element).find('.action_room_scheduled,.action_room_scheduled_cancel,.action_room_open,.action_room_checkout').parent('li').addClass('disabled');
			return this;
		},
		//预定
		//显示预定窗口
		action_room_scheduled: function() {
			var rs_dialog = new db.ktv_sale.RoomScheduledWidget(null, {
				room: this.model
			});
			rs_dialog.render_element();
			rs_dialog.start();
			var options = {
				title: "预定",
				buttons: {
					"保存预定信息": function() {
						rs_dialog.save();
						//rs_dialog.$element.dialog('close');
					},
					"取消": function() {
						rs_dialog.$element.dialog('close');
					}
				}
			};
			new db.web.Dialog(null, options, rs_dialog.$element).open();

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
			this.ktv_shop = options.ktv_shop;
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

