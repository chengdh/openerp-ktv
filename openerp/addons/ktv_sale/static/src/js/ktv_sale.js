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
			this.store = new Store();
			this.ready = $.Deferred();
			this.session = session;
			//定义pos特有的属性,由于可能有多个pos终端,这些属性都不同
			var attributes = {
				'pending_operations': [],
				//挂起还未与服务器端同步的操作
				'currency': {
					symbol: '$',
					position: 'after'
				},
				//货币符号
				'shop': {},
				//当前商店,可能会有多个商店
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
				'fields': ['id', 'name'],
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
				'fields': ['id', 'name'],
				'domain': []
			},
			//room      //包厢信息
			'ktv.room': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//buyout_config //买断设置
			'ktv.buyout_config': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//buyout_config_special_day //买断特殊日设置
			'ktv.buyout_config_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//buffet_config buffet_config_special_day 自助餐设置
			'ktv.buffet_config': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.buffet_config_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//minimum_fee_config minimum_fee_config_special_day时段低消设置
			'ktv.minimum_fee_config': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.minimum_fee_config_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//price_class 价格类型
			'ktv.price_class': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//hourly_fee_discount hourly_fee_p_discount member_hourly_fee_discount 时段钟点费设置
			'ktv.hourly_fee_discount': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.hourly_fee_discount_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.hourly_fee_p_discount_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.member_hourly_fee_discount_special_day': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//hourly_fee_promotion 买钟优惠设置
			'ktv.hourly_fee_promotion': {
				'fields': ['id', 'name'],
				'domain': []
			},
			//member_class会员卡等级设置
			'ktv.member_class': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//member_class_change_config 会员卡升降级设置
			'ktv.member_class_change_config': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//discount_card_type 打折卡设置
			'ktv.discount_card_type': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//song_ticket 欢唱券设置
			'ktv.song_ticket': {
				'fields': ['id', 'name'],
				'domain': []
			},

			//sales_voucher_type sales_voucher 抵用券设置
			'ktv.sale_voucher_type': {
				'fields': ['id', 'name'],
				'domain': []
			},
			'ktv.sale_voucher': {
				'fields': ['id', 'name'],
				'domain': []
			}
		}

	});

	//全局的ktv_room_pos对象
	var ktv_room_pos;
};

