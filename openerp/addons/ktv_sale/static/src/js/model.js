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
        'ktv.member' : {
            'model_class' : 'Member',
            'fields' : ['id','member_no','name','member_class_id','member_card_no','make_fee','valid_date','phone','birthday'],
            'domain' : [['active','=',true]]
        },

		//discount_card_type 打折卡设置
		'ktv.discount_card_type': {
			'model_class': 'DiscountCardType',
			'fields': ['id', 'name', 'drinks_fee_discount', 'room_fee_discount', 'card_fee'],
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
			//是否已从服务器端获取了数据
			this.ready = $.Deferred();
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
			_.each(this.get_active_buyout_config_lines(), function(l) {
				active_buyout_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
					break_on_active: l.get("break_on_active"),
					break_on: l.get("break_on"),
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
			_.each(this.get_active_buffet_config_lines(), function(l) {
				active_buffet_config_lines.push({
					name: l.get("name"),
					time_range: l.get("time_from") + "~" + l.get("time_to"),
					is_member: l.get("is_member"),
					break_on_active: l.get("break_on_active"),
					break_on: l.get("break_on"),
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
			model.fetch_by_osv_name("ktv.room_type",{"domain" : [["id","=",room_type_id]]}).pipe(function(result) {
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
				return $.when(self._set_minimum_fee(), self._set_hourly_fee_discount("hourly_fee_discount"), self._set_hourly_fee_discount("hourly_fee_discount", true), self._set_hourly_fee_discount("hourly_fee_p_discount"), self._set_hourly_fee_discount("hourly_fee_p_discount", true), self._set_hourly_fee_discount("member_hourly_fee_discount"), self._set_hourly_fee_discount("member_hourly_fee_discount", true), self._set_buyout_config(), self._set_buffet_config(), self._set_hourly_fee_promotion()).then(function() {
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
			var today = Date.today();
			var minimum_fee_configs, minimum_fee_config_special_days;
			$.when(model.fetch_by_osv_name("ktv.minimum_fee_config").then(function(result) {
				minimum_fee_configs = result;
			}), model.fetch_by_osv_name("ktv.minimum_fee_config_special_day").then(function(result) {
				minimum_fee_config_special_days = result;
			})).then(
			function() {
				//得到当日的特殊日设置
				var sd_config = _.find(minimum_fee_config_special_days, function(c) {
					return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
				});
				//设置周一至周日
				_.each(minimum_fee_configs, function(c) {
					if (c.room_type_id[0] == the_room_type.get("id")) {
						//判断当日是周几
						var today_week_day = erp_instance.ktv_sale.helper.today_week_day();
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

						self.get("minimum_fee_config_lines").add(today_config);
					}
				},
				self);
			})
		},
		//设置包厢时段钟点费
		//load_all 读取所有设置,默认只读取当日设置
		_set_hourly_fee_discount: function(which_fee, load_all) {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			var hourly_fee_configs, hourly_fee_config_special_days;
			return $.when(model.fetch_by_osv_name("ktv." + which_fee).then(function(result) {
				hourly_fee_configs = result;
			}), model.fetch_by_osv_name("ktv." + which_fee + "_special_day").then(function(result) {
				hourly_fee_config_special_days = result;
			})).then(function() {
				//得到当日的特殊日设置
				var sd_config = _.find(hourly_fee_config_special_days, function(c) {
					return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
				});
				//设置周一至周日
				_.each(hourly_fee_configs, function(c) {
					if (c.room_type_id[0] == the_room_type.get("id")) {
						//判断当日是周几
						var today_week_day = erp_instance.ktv_sale.helper.today_week_day();
						var today_config = {
							price_class_id: c["price_class_id"][0],
							price_class_name: c["price_class_id"][1],
							base_hourly_fee: c.base_hourly_fee,
							time_from: c.time_from,
							time_to: c.time_to,
							hourly_fee: c[today_week_day + "_hourly_fee"],
							hourly_fee_discount: c[today_week_day + "_hourly_discount"]
						};
						if (c.member_class_id) {
                            today_config.member_class_id = c.member_class_id[0];
                            today_config.member_class_name = c.member_class_id[1];
                        }
						//如果当日是特殊日,则用特殊日设置覆盖当日设置
						if (sd_config) {
							today_config.hourly_fee = c["special_day_hourly_fee"];
							today_config.hourly_discount = c["special_day_hourly_discount"];
						}
						if (load_all) {
							today_config = c;
							self.get("all_" + which_fee + "_lines").add(today_config);
						}
						else self.get("today_" + which_fee + "_lines").add(today_config);
					}
				},
				self);
			});
		},
		//设置买断信息
		_set_buyout_config: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			var buyout_configs, buyout_config_special_days;
			return $.when(model.fetch_by_osv_name("ktv.buyout_config").then(function(result) {
				buyout_configs = result;
			}), model.fetch_by_osv_name("ktv.buyout_config_special_day").then(function(result) {
				buyout_config_special_days = result;
			})).then(function() {
				//得到当日的特殊日设置
				var sd_config = _.find(buyout_config_special_days, function(c) {
					return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
				});
				//设置周一至周日
				_.each(buyout_configs, function(c) {
					if (c.room_type_id[0] == the_room_type.get("id")) {
						//判断当日是周几
						var today_week_day = erp_instance.ktv_sale.helper.today_week_day();
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
						if (today_config) self.get("buyout_config_lines").add(today_config);
					}
				},
				self);

			});
		},
		//设置自助餐买断信息
		_set_buffet_config: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today();
			var buffet_config, buffet_config_special_days;
			return $.when(model.fetch_by_osv_name("ktv.buffet_config").then(function(result) {
				buffet_configs = result;
			}), model.fetch_by_osv_name("ktv.buffet_config_special_day").then(function(result) {
				buffet_config_special_days = result;
			})).then(function() {
				//得到当日的特殊日设置
				var sd_config = _.find(buffet_config_special_days, function(c) {
					return (c.room_type_id[0] == the_room_type.get("id") && Date.parse(c.special_day).equals(today));
				});
				//设置周一至周日
				_.each(buffet_configs, function(c) {
					if (c.room_type_id[0] == the_room_type.get("id")) {
						//判断当日是周几
						var today_week_day = erp_instance.ktv_sale.helper.today_week_day();
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
						if (today_config) self.get("buffet_config_lines").add(today_config);
					}
				},
				self);
			});
		},
		//设置买钟优惠
		_set_hourly_fee_promotion: function() {
			var self = this;
			var the_room = this.get("room");
			var the_room_type = this.get("room_type");
			var today = Date.today().setTimeToNow();
			var hourly_fee_promotions;
			return model.fetch_by_osv_name("ktv.hourly_fee_promotion").then(function(result) {
				hourly_fee_promotions = result;
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
						var today_week_day = erp_instance.ktv_sale.helper.today_week_day();
						if (!c[today_week_day + "_active"]) today_config = null;
					}
					if (today_config) self.get("hourly_fee_promotion_lines").add(today_config);
				},
				self);
			});
		}
	});
	//预定对象
	model.RoomScheduled = Backbone.Model.extend({
        //将数据上传至服务器
        push : function(){
            return new erp_instance.web.Model("ktv.room").get_func("create_room_scheduled")(this.toJSON());
        }
    });
    //开房对象
    model.RoomOpens = Backbone.Model.extend({
        defaults : {
            "persons_count" : 4
        },
        //上传数据到服务器
        push : function(){
            return new erp_instance.web.Model("ktv.room").get_func("create_room_opens")(this.toJSON());
        }
    });

    //预售-买断对象
    model.RoomBuyout = Backbone.Model.extend({
        defaults : {
            "persons_count" : 4,
            "time_from" : Date.today().setTimeToNow()
        }
    });
};

