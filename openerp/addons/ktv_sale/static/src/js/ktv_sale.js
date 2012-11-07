//定义ktv开房pos界面
openerp.ktv_sale = function(db) {
	db.ktv_sale = {};

	var QWeb = db.web.qweb;
	var qweb_template = function(template) {
		return function(ctx) {
			return QWeb.render(template, _.extend({},
			ctx, {
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
	db.ktv_sale.ktv_room_pos = {};

	//模型类
	//包厢
	//一个包厢当前有一个room_operate
	//一个room_operate可有多个包厢相关的操作,比如开房、并房、换房等
	db.ktv_sale.Room = Backbone.Model.extend({
		initialize: function(attributes) {
			Backbone.Model.prototype.initialize.apply(this, arguments);
			//如果包厢信息发生变化,更新Localstorage中的数据
			this.bind('change', function() {
				var rooms = db.ktv_sale.ktv_room_pos.store.get('ktv.room');
				var changed_room = _.find(rooms, function(r) {
					return r.id == this.get('id')
				},
				this);
				if (changed_room) _.extend(changed_room, this.toJSON());
				db.ktv_sale.ktv_room_pos.store.set('ktv.room', rooms);
			},
			this);
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
                room_status : {},
				current_room: null
			});
            this.bind('change:rooms',this.update_room_status,this);
            this.update_room_status();
		},
		//更新房态
		update_room_status: function() {
			var rooms = this.get('rooms');
			var states = ['free', 'in_use', 'scheduled', 'locked', 'checkout', 'buyout', 'malfunction', 'visit', 'clean', 'debug'];
            var room_status = {};
			_.each(states, function(s) {
				room_status[s] = (_.filter(rooms, function(r) {
					r['state'] == s
				})).length
			},
			this);
            this.set({'room_status' : room_status});
		}
	});

	//显示widget
	//ShopWidget
	db.ktv_sale.KtvShopWidget = db.web.OldWidget.extend({
        init: function(parent,options) {
            this._super(parent);
            this.ktv_shop = options.ktv_shop;
        },
        start: function(){
            this.room_list_view = new db.ktv_sale.RoomListWidget(null,{ktv_shop : this.ktv_shop});
        }
    });
	//roomWidget
	db.ktv_sale.RoomWidget = db.web.OldWidget.extend({
        init: function(parent,options){
            this._super(parent);
            this.model = options.model;
            this.ktv_shop = options.ktv_shop;
        },
        //设置当前选中的包厢
        select_room : function(evt){
            evt.preventDefault();
            this.ktv_shop.set({current_room : this.model});
        }
    });
	//房间列表
	db.ktv_sale.RoomListWidget = db.web.OldWidget.extend({
        init: function(parent,options) {
            this._super(parent);
            this.ktv_shop = options.ktv_shop;
            //房间数据变化时激发重绘列表
            this.ktv_shop.get('rooms').bind('reset',this.render_element,this);
        },
        render_element : function(){
            this.$element.empty();
            this.ktv_shop.get('rooms').each(_.bind(function(r){
                var r_widget = new db.ktv_sale.RoomWidget(null,{model : r});
                r_widget.appendTo(this.$element);
            },this),this);
            return this;
        }
    });
	//房态统计
	db.ktv_sale.RoomStatusWidget = db.web.OldWidget.extend({
        init : function(parent,options){
            this.ktv_shop = options.ktv_shop;
            //ktv_shop中的包厢数据发生变化时,重绘房态组件
            this.ktv_shop.bind('change:room_status',this.render_element,this);
        },
        render_element : function() {
            this.$element.empty();
            //TODO 显示room_status组件
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
        };
        return App;


    })();

	//openerp的入口组件,用于定义系统的初始入口处理
	db.web.client_actions.add('ktv_room_pos.ui', 'db.ktv_sale.RoomPointOfSale');
	db.ktv_sale.RoomPointOfSale = db.web.OldWidget.extend({
		init: function() {
			this._super.apply(this, arguments);
			if (db.ktv_sale.ktv_room_pos['session']) throw "It is not possible to instantiate multiple instances " + "of the point of sale at the same time.";
			db.ktv_sale.ktv_room_pos = new db.ktv_sale.KtvRoomPos(this.session);
		},
		start: function() {
			db.ktv_sale.ktv_room_pos.app = new db.ktv_sale.App(self.$element);
			$('.oe_toggle_secondary_menu').hide();
			$('.oe_footer').hide();
		}
	});
};

