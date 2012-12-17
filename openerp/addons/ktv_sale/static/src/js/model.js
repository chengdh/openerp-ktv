//将model定义分开
//erp_instance openerp的客户端实例对象，在boot.js中初始化
openerp.ktv_sale.model = function(erp_instance) {
	var model = erp_instance.ktv_sale.model = {};
	//自服务器端获取数据
	model._fetch = function(osvModel, fields, domain) {
		var dataSetSearch;
		dataSetSearch = new erp_instance.web.DataSetSearch(null, osvModel, {},
		domain);
		return dataSetSearch.read_slice(fields, 0);
	},
	//根据osv_model名称从服务器端获取数据
	model.fetch_by_osv_name = function(osv_name, options) {
		var fields = model._osv_objects[osv_name]['fields'];
		var domain = model._osv_objects[osv_name]['domain'];
		if (options && options['fields']) fields = options['fields'];

		if (options && options['domain']) domain = options['domain'];

		return model._fetch(osv_name, fields, domain);
	},
	//需要从服务器端同步的对象
	model._osv_objects = {
		//fee_type  //计费方式
		'ktv.fee_type': {
			'model_class': 'FeeType',
			'model_collection_class': 'FeeTypeCollection',
			'fields': ['id', 'fee_type_code', 'name'],
			'domain': []
		},
		//fee_type_member_class_discount //计费方式-会员折扣信息
		'ktv.fee_type_member_class_discount': {
			'model_class': 'FeeTypeMemberClassDiscount',
			'model_collection_class': 'FeeTypeMemberClassDiscountCollection',
			'fields': ['fee_type_id', 'memeber_class_id', 'drinks_fee_discount', 'room_fee_discount'],
			'domain': []
		},
		//pay_type //付款方式
		'ktv.pay_type': {
			'model_class': 'PayType',
			'model_collection_class': 'PayTypeCollection',
			'fields': ['id', 'name'],
			'domain': []
		},
		//room_area //包厢区域
		'ktv.room_area': {
			'model_class': 'RoomArea',
			'fields': ['id', 'name'],
			'domain': []
		},
		//room_type  //包厢类别
		'ktv.room_type': {
			'model_class': 'RoomType',
			'fields': ['id', 'name', 'drinks_price_type', 'fee_type_id', 'serve_persons', 'room_fee', 'hourly_fee', 'hourly_fee_p', 'minimum_fee', 'minimum_fee_p', 'service_fee', 'present_rate'],
			'domain': []
		},
		//room      //包厢信息
		'ktv.room': {
			'model_class': 'Room',
			'fields': ['id', 'name', 'room_area_id', 'room_type_id', 'fee_type_id', 'ktv_box_ip', 'room_fee', 'hourly_fee', 'minimum_fee', 'hourly_fee_p', 'minimum_fee_p', 'minimum_persons', 'sequence', 'state'],
			'domain': []
		},
		//buyout_config //买断设置
		'ktv.buyout_config': {
			'model_class': 'BuyoutConfig',
			'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'thu_buyout_enable', 'thu_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'special_day_buyout_fee'],
			'domain': []
		},
		//buyout_config_special_day //买断特殊日设置
		'ktv.buyout_config_special_day': {
			'model_class': 'BuyoutConfigSpecialDay',
			'fields': ['room_type_id', 'special_day'],
		},

		//buffet_config buffet_config_special_day 自助餐设置
		'ktv.buffet_config': {
			'model_class': 'BuffetConfig',
			'fields': ['id', 'name', 'room_type_id', 'is_member', 'time_from', 'time_to', 'break_on_enable', 'break_on', 'buyout_time', 'mon_buyout_enable', 'mon_buyout_fee', 'mon_child_buyout_fee', 'tue_buyout_enable', 'tue_buyout_fee', 'tue_child_buyout_fee', 'wed_buyout_enable', 'wed_buyout_fee', 'wed_child_buyout_fee', 'thu_buyout_enable', 'thu_buyout_fee', 'thu_child_buyout_fee', 'fri_buyout_enable', 'fri_buyout_fee', 'fri_child_buyout_fee', 'sat_buyout_enable', 'sat_buyout_fee', 'sat_child_buyout_fee', 'sun_buyout_enable', 'sun_buyout_fee', 'sun_child_buyout_fee', 'special_day_buyout_fee', 'special_day_child_buyout_fee'],
			'domain': []
		},
		'ktv.buffet_config_special_day': {
			'model_class': 'BuffetConfigSpecialDay',
			'fields': ['room_type_id', 'special_day'],
		},

		//minimum_fee_config minimum_fee_config_special_day时段低消设置
		'ktv.minimum_fee_config': {
			'model_class': 'MinimumFeeConfig',
			'fields': ['room_type_id', 'time_from', 'time_to', 'mon_minimum_fee', 'mon_minimum_fee_p', 'mon_room_fee', 'tue_minimum_fee', 'tue_minimum_fee_p', 'tue_room_fee', 'wed_minimum_fee', 'wed_minimum_fee_p', 'wed_room_fee', 'thu_minimum_fee', 'thu_minimum_fee_p', 'thu_room_fee', 'fri_minimum_fee', 'fri_minimum_fee_p', 'fri_room_fee', 'sat_minimum_fee', 'sat_minimum_fee_p', 'sat_room_fee', 'sun_minimum_fee', 'sun_minimum_fee_p', 'sun_room_fee', 'special_day_minimum_fee', 'special_day_minimum_fee_p', 'special_day_room_fee'],
			'domain': [['active', '=', true]]
		},
		'ktv.minimum_fee_config_special_day': {
			'model_class': 'MinimumFeeConfigSpecialDay',
			'fields': ['room_type_id', 'special_day'],
			'domain': []
		},
		//price_class 价格类型
		'ktv.price_class': {
			'model_class': 'PriceClass',
			'fields': ['id', 'name', 'sequence'],
			'domain': [['active', '=', true]]
		},

		//hourly_fee_discount hourly_fee_p_discount member_hourly_fee_discount 时段钟点费设置
		'ktv.hourly_fee_discount': {
			'model_class': 'HourlyFeeDiscount',
			'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
			'domain': []
		},
		'ktv.hourly_fee_discount_special_day': {
			'model_class': 'HourlyFeeDiscountSpecialDay',
			'fields': ['room_type_id', 'special_day'],
			'domain': []
		},
		'ktv.hourly_fee_p_discount': {
			'model_class': 'HourlyFeePDiscount',
			'fields': ['id', 'price_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
			'domain': []
		},
		'ktv.hourly_fee_p_discount_special_day': {
			'model_class': 'HourlyFeePDiscountSpecialDay',
			'fields': ['room_type_id', 'special_day'],
			'domain': []
		},
		'ktv.member_hourly_fee_discount': {
			'model_class': 'MemberHourlyFeeDiscount',
			'fields': ['id', 'price_class_id', 'member_class_id', 'room_type_id', 'time_from', 'time_to', 'base_hourly_fee', 'mon_hourly_fee', 'mon_hourly_discount', 'tue_hourly_fee', 'tue_hourly_discount', 'wed_hourly_fee', 'wed_hourly_discount', 'thu_hourly_fee', 'thu_hourly_discount', 'fri_hourly_fee', 'fri_hourly_discount', 'sat_hourly_fee', 'sat_hourly_discount', 'sun_hourly_fee', 'sun_hourly_discount', 'special_day_hourly_fee', 'special_day_hourly_discount'],
			'domain': []
		},
		'ktv.member_hourly_fee_discount_special_day': {
			'model_class': 'MemberHourlyFeeDiscountSpecialDay',
			'fields': ['room_type_id', 'member_class_id', 'special_day'],
			'domain': []
		},

		//hourly_fee_promotion 买钟优惠设置
		'ktv.hourly_fee_promotion': {
			'model_class': 'HourlyFeePromotion',
			'fields': ['id', 'name', 'is_member', 'buy_minutes', 'present_minutes', 'active_datetime_limit', 'datetime_from', 'datetime_to', 'active_time_limit', 'time_from', 'time_to', 'mon_active', 'tue_active', 'wed_active', 'thu_active', 'fri_active', 'sat_active', 'sun_active'],
			'domain': []
		},
		//member_class会员卡等级设置
		'ktv.member_class': {
			'model_class': 'MemberClass',
			'fields': ['id', 'name', 'card_fee', 'drinks_fee_discount', 'room_fee_discount', 'up_card_fee', 'drinks_price_type', 'room_limit_count', 'market_limit_count', 'can_points', 'can_manual_input', 'can_store_money'],
			'domain': [['active', '=', true]]
		},
		//member 会员信息设置
		'ktv.member': {
			'model_class': 'Member',
			'fields': ['id', 'member_no', 'name', 'member_class_id', 'member_card_no', 'make_fee', 'valid_date', 'balance', 'phone', 'birthday'],
			'domain': [['active', '=', true]]
		},

		//discount_card_type 打折卡设置
		'ktv.discount_card_type': {
			'model_class': 'DiscountCardType',
			'fields': ['id', 'name', 'drinks_fee_discount', 'room_fee_discount', 'card_fee'],
			'domain': [['active', '=', true]]
		},
		//打折卡
		'ktv.discount_card': {
			'model_class': 'DiscountCard',
			'fields': ['id', 'card_no', 'discount_card_type_id', 'card_fee', 'valid_date'],
			'domain': [['active', '=', true]]
		},

		//song_ticket 欢唱券设置
		'ktv.song_ticket': {
			'model_class': 'SongTicket',
			'fields': ['id', 'name', 'room_type_id', 'equal_time_limit', 'active_time_limit', 'time_from', 'time_to'],
			'domain': [['active', '=', true]]
		},

		//sales_voucher_type sales_voucher 抵用券设置
		'ktv.sales_voucher_type': {
			'model_class': 'SalesVoucherType',
			'fields': ['id', 'name', 'face_value'],
		},
		'ktv.sales_voucher': {
			'model_class': 'SalesVoucher',
			'model_collection_class': 'SalesVoucherCollection',
			'fields': ['id', 'id_number', 'as_money', 'datetime_from', 'datetime_to', 'state'],
		}
	};
	//生成Backbone对象
	for (m in model._osv_objects) {
		var model_class = model._osv_objects[m]['model_class'];
		var model_collection_class = model_class + "Collection";
		model[model_class] = Backbone.Model.extend({},
		{
			//自服务器端获取数据
			fetch: function() {
				var osv_model = m;
				var fields = model._osv_objects[m]['fields'];
				var domain = model._osv_objects[m]['domain'];
				return function() {
					return model._fetch(osv_model, fields, domain);
				};
			} ()
		});
		model[model_collection_class] = Backbone.Collection.extend({
			model: model[model_class]
		});
	}

	//以下定义房态
	//扩展Room定义
	model.Room.states = ("free in_use scheduled locked checkout buyout buytime malfunction visit clean debug").split(/\s/);
	_.extend(model.Room.prototype, {
		get_state_desc: function() {
			return erp_instance.ktv_sale.helper.get_room_state_desc(this.get('state'));
		},
		//获取room_fee_info对象
		get_room_fee_info: function() {
			var room_fee_info = new model.RoomFeeInfo({
				"room": this
			});
			return room_fee_info;
		},
		//导出到json
		export_as_json: function() {
			var ret = this.toJSON();
			ret.state_description = this.get_state_desc();
			return ret;
		}
	});

	//定义ktv_room_point对象,该对象对应一个ktv的收银结账柜台
	model.KtvRoomPoint = Backbone.Model.extend({
		initialize: function() {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.set({
				//全部包厢
				all_rooms: new model.RoomCollection(),
				//当前显示的包厢列表
				display_rooms: new model.RoomCollection(),
				//房间类型room_type
				room_types: new model.RoomTypeCollection(),
				//房间区域
				room_areas: new model.RoomAreaCollection(),
				//计费方式
				fee_types: new model.FeeTypeCollection(),
				//价格类型
				price_classes: new model.PriceClassCollection(),
				//客户分类
				member_classes: new model.MemberClassCollection(),
				//付款方式
				pay_types: new model.PayTypeCollection(),
				//房态统计
				room_status: {}
			});
			this.get('display_rooms').bind('change', this._update_room_status, this);
			this.get('display_rooms').bind('reset', this._update_room_status, this);
			this.ready = $.Deferred();
			var self = this;
			$.when(model.Room.fetch().pipe(function(result) {
				self.get("all_rooms").reset(result);
				self.get("display_rooms").reset(result);
				//设置当前选中包厢
				var display_rooms = self.get("display_rooms");
				if (display_rooms.length > 0) self.set({
					"current_room": display_rooms.at(0)
				});
			}), model.RoomArea.fetch().pipe(function(result) {
				self.get('room_areas').reset(result);
			}), model.RoomType.fetch().pipe(function(result) {
				self.get('room_types').reset(result);
			}), model.FeeType.fetch().pipe(function(result) {
				self.get('fee_types').reset(result);
			}), model.PriceClass.fetch().pipe(function(result) {
				self.get('price_classes').reset(result);
			}), model.MemberClass.fetch().pipe(function(result) {
				self.get('member_classes').reset(result);
			}), model.PayType.fetch().pipe(function(result) {
				self.get('pay_types').reset(result);
			})).then(function() {
				self.ready.resolve();
			});
		},
		//更新房态
		_update_room_status: function() {
			var rooms = this.get('display_rooms');
			var room_status = {};
			_.each(model.Room.states, function(s) {
				var state_rooms = rooms.filter(function(r) {
					return r.get("state") == s
				});
				room_status[s] = state_rooms.length;
			});
			this.set({
				'room_status': room_status
			});
		},
		//根据包厢状态返回包厢数组
		get_rooms_by_state: function(r_state) {
			var ret = this.get("all_rooms");
			if (r_state) ret = this.get("all_rooms").filter(function(r) {
				if (_.isArray(r_state)) return _.contains(r_state, r.get("state"));
				else return r.get("state") == r_state;
			});
			return new Backbone.Collection().add(ret);
		},

	});

	//RoomFeeInfo对象,定义包厢所有相关费用信息
	//包厢费用信息,在开房结账时会使用到包厢的费用信息,
	//费用信息包括包厢费、最低消费、钟点费、会员折扣、买钟优惠等信息,不同种类的包厢,其信息是不同的
	//费用信息也与日期相关,只提取当日有关信息
	model.RoomFeeInfo = Backbone.Model.extend({
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.set({
				//时段低消设置
				"minimum_fee_config_lines": new Backbone.Collection(),
				//设置包厢时段钟点费
				"hourly_fee_discount_lines": new Backbone.Collection(),
				//设置会员时段钟点费
				"member_hourly_fee_discount_lines": new Backbone.Collection(),
				//设置按位时段钟点费
				"hourly_fee_p_discount_lines": new Backbone.Collection(),
				//买断设置
				"buyout_config_lines": new Backbone.Collection(),
				//自助餐设置
				"buffet_config_lines": new Backbone.Collection(),
				//设置买钟优惠
				"hourly_fee_promotion_lines": new Backbone.Collection()
			});
			//是否已从服务器端获取了数据
			this.ready = $.Deferred();
			this.bind("change:room", this._on_room_change, this);
			this.bind("change:room_type_id", this._on_room_type_id_change, this);
			this._on_room_change();
		},

		//获取当前可用的买断列表
		//只有当前时间在买断设定的时间内,买断才可用
		get_active_buyout_config_lines: function() {
			var lines = this.get("buyout_config_lines");
			return lines;
		},
		//获取当前可用的自助餐设置
		//include_member 是否包含会员设置,默认情况下不包含
		get_active_buffet_config_lines: function(include_member) {
			var lines = this.get("buffet_config_lines");
			return lines;
		},

		//计算相关费用,根据系统设置中的数据计算包厢费、最低消费、按位低消金额
		_get_current_fee: function(which_fee) {
			var current_fee = this.get(which_fee);
			var minimum_lines = this.get("minimum_fee_config_lines");
            if(minimum_lines.length > 0)
            {
                match_line = minimum_lines.at(0);
            }
			current_fee = match_line.get(which_fee);
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
			var active_buyout_config_lines = [];
			this.get("buyout_config_lines").each(function(l) {
				active_buyout_config_lines.push({
                    id: l.get("id"),
					name: l.get("name"),
					time_range: erp_instance.web.str_to_datetime(l.get("time_from")).toString("HH:mm") + "~" + erp_instance.web.str_to_datetime(l.get("time_to")).toString('HH:mm'),
					is_member: l.get("is_member"),
					buyout_time: l.get("buyout_time"),
					buyout_fee: l.get("buyout_fee")
				});
			});
			ret.active_buyout_config_lines = active_buyout_config_lines;
			//自助餐设置
			var active_buffet_config_lines = [];
			this.get("buffet_config_lines").each(function(l) {
				active_buffet_config_lines.push({
                    id: l.get("id"),
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
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
                    id: l.get("id"),
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
			if (this.get(which_fee + "_lines").length == 0) hourly_fee_lines.push({
                id : -1,
				member_class_id: - 1,
				price_class_id: - 1,
				base_hourly_fee: this.get(which_fee),
				"time_range": "00:00 ~ 24:00",
				hourly_fee_discount: "不打折",
				hourly_fee: this.get("hourly_fee")
			});
			else {
				this.get(which_fee + "_lines").each(function(l) {
					hourly_fee_lines.push({
                        id : l.get("id"),
						member_class_id: l.get("member_class_id"),
						member_class_name: l.get("member_class_name"),
						price_class_id: l.get("price_class_id"),
						price_class_name: l.get("price_class_name"),
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
			var self = this;
			var room = this.get("room");
			var room_type_id = this.get("room_type_id");
			//获取room_type完整信息
			model.fetch_by_osv_name("ktv.room_type", {
				"domain": [["id", "=", room_type_id]]
			}).pipe(function(result) {
				var room_type = new model.RoomType(result[0]);
				self.set({
					"room_type": room_type
				});
				return room_type;
			}).pipe(function(room_type) {
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
				self.set({
					room_fee: room_fee,
					hourly_fee: hourly_fee,
					hourly_fee_p: hourly_fee_p,
					minimum_fee: minimum_fee,
					minimum_fee_p: minimum_fee_p,
					present_rate: present_rate,
					service_fee: service_fee,
					minimum_persons: minimum_persons
				});
			}).then(function() {
				return $.when(self._set_minimum_fee(), self._set_hourly_fee_discount(), self._set_buyout_config(), self._set_buffet_config(), self._set_hourly_fee_promotion()).then(function() {
					self.ready.resolve();
				});
			});
		},
		//设置时段低消费用
		//只提取当日相关信息,且该信息active = true
		//若费用存在但是为0,则取包厢设置
		_set_minimum_fee: function() {
			var self = this;
			var the_room = self.get("room");
			var the_room_type = self.get("room_type");
			return new erp_instance.web.Model('ktv.minimum_fee_config').get_func('get_active_configs')(the_room_type.get('id')).pipe(function(result) {
				self.get("minimum_fee_config_lines").add(result);
			});
		},
		//设置包厢时段钟点费
		_set_hourly_fee_discount: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			return $.when(
			//时段钟点费设置
			new erp_instance.web.Model('ktv.hourly_fee_discount').get_func('get_active_configs')(the_room_type.get('id'), {
				which_fee: 'hourly_fee_discount'
			}).pipe(function(result) {
				self.get('hourly_fee_discount_lines').add(result);
			}),
			//会员时段钟点费设置
			new erp_instance.web.Model('ktv.member_hourly_fee_discount').get_func('get_active_configs')(the_room_type.get('id'), {
				which_fee: 'member_hourly_fee_discount'
			}).pipe(function(result) {
				self.get('member_hourly_fee_discount_lines').add(result);
			}),
			//按位时段钟点费设置
			new erp_instance.web.Model('ktv.hourly_fee_p_discount').get_func('get_active_configs')(the_room_type.get('id'), {
				which_fee: 'hourly_fee_p_discount'
			}).pipe(function(result) {
				self.get('hourly_fee_p_discount_lines').add(result);
			}));
		},
		//设置买断信息
		_set_buyout_config: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			return new erp_instance.web.Model('ktv.buyout_config').get_func('get_active_configs')(the_room_type.get('id')).pipe(function(result) {
				self.get("buyout_config_lines").add(result);
			});
		},
		//设置自助餐买断信息
		_set_buffet_config: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			return new erp_instance.web.Model('ktv.buffet_config').get_func('get_active_configs')(the_room_type.get('id')).pipe(function(result) {
				self.get("buffet_config_lines").add(result);
			});
		},
		//设置买钟优惠
		_set_hourly_fee_promotion: function() {
			var self = this;
			return new erp_instance.web.Model('ktv.hourly_fee_promotion').get_func('get_active_configs')().pipe(function(result) {
				self.get("hourly_fee_promotion_lines").add(result);
			});
		}
	});
	//预定对象
	model.RoomScheduled = Backbone.Model.extend({
		//将数据上传至服务器
		push: function() {
			return new erp_instance.web.Model("ktv.room").get_func("create_room_scheduled")(this.toJSON());
		}
	});
	//开房对象
	model.RoomOpens = Backbone.Model.extend({
		defaults: {
			"persons_count": 4
		},
		//上传数据到服务器
		push: function() {
			return new erp_instance.web.Model("ktv.room").get_func("create_room_opens")(this.toJSON());
		}
	});

	//预售-买断对象
	model.RoomCheckoutBuyout = Backbone.Model.extend({
		defaults: {
			"persons_count": 4,
			"after_discount_fee": 0.0,
			"cash_fee": 0.0,
			"member_card_fee": 0.0,
			"credit_card_fee": 0.0,
			"sales_voucher_fee": 0.0,
			"free_fee": 0.0,
			"on_credit_fee": 0.0,
			"act_pay_fee": 0.0,
			"change_fee": 0.0
		},
		initialize: function(attrs) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			this.bind("change:member_card_fee", this._re_calculate_cash_fee, this);
			this.bind("change:credit_card_fee", this._re_calculate_cash_fee, this);
			this.bind("change:sales_voucher_fee", this._re_calculate_cash_fee, this);
			this.bind("change:on_credit_fee", this._re_calculate_cash_fee, this);
			this.bind("change:free_fee", this._re_calculate_cash_fee, this);
			this.bind("change:act_pay_fee", this._calculate_change_fee, this);
		},
		//重新计算应付现金
		_re_calculate_cash_fee: function() {
			var after_discount_fee = this.get('after_discount_fee');
			var member_card_fee = this.get('member_card_fee');
			var credit_card_fee = this.get('credit_card_fee');
			var sales_voucher_fee = this.get('sales_voucher_fee');
			var free_fee = this.get('free_fee');
			var on_credit_fee = this.get('on_credit_fee');
			var cash_fee = after_discount_fee - member_card_fee - credit_card_fee - sales_voucher_fee - free_fee - on_credit_fee
			this.set({
				"cash_fee": cash_fee
			},
			{
				silent: true
			});
			this.set({
				"act_pay_fee": cash_fee
			},
			{
				silent: true
			});
			this.set({
				"change_fee": 0
			});
			//TODO 还需要
		},
		//计算找零金额
		_calculate_change_fee: function() {
			var act_pay_fee = this.get("act_pay_fee");
			var change_fee = act_pay_fee - this.get('cash_fee');
			this.set({
				"change_fee": change_fee
			});
		},
		//保存数据到服务器
		push: function() {
			//发送数据到服务器端
			var room_checkout_vals = this.export_as_json();
			return new erp_instance.web.Model('ktv.room_checkout_buyout').get_func('create_from_ui')(room_checkout_vals);
		},
		export_as_json: function() {
			var json = this.toJSON();
			//删除不需要的属性,以下这些字段使用服务器端的function计算
			delete json.sum_should_fee;
			delete json.after_discount_fee;
			delete json.discount_rate;
			delete json.discount_fee;
			delete json.change_fee;
			var member_card = this.get('member_card');
			if (member_card && member_card.get("id")) json.member_card_id = member_card.get("id");
			var discount_card = this.get('member_card');
			if (discount_card && discount_card.get("id")) json.discount_card_id = discount_card.get("id");

			var credit_card = this.get('credit_card');

			if (credit_card && credit_card.get("card_no")) json.credit_card_no = credit_card.get("card_no");
			var sales_voucher_collection = this.get('sales_voucher_collection');
			if (sales_voucher_collection.length > 0) json.sales_vouchers = sales_voucher_collection.toJSON();
			//删除不需要的属性
			delete json.member_card;
			delete json.discount_card;
			delete json.credit_card;
			delete json.sales_voucher_collection;

			return json;
		}

	});
};
