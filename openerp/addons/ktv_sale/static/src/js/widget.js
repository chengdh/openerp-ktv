//widget定义
//erp_instance openerp的客户端实例对象，在boot.js中初始化
openerp.ktv_sale.widget = function(erp_instance) {
	//扩展通用的模板方法
	var QWeb = erp_instance.web.qweb;
	var qweb_template = function(template) {
		return function(ctx) {
			return QWeb.render(template, _.extend({},
			ctx, {
				//以下定义需要在界面上显示的数据
				'all_rooms': erp_instance.ktv_sale.ktv_room_point.get('all_rooms').toJSON(),
				'display_rooms': erp_instance.ktv_sale.ktv_room_point.get('display_rooms').toJSON(),
				'room_types': erp_instance.ktv_sale.ktv_room_point.get('room_types').toJSON(),
				'room_areas': erp_instance.ktv_sale.ktv_room_point.get('room_areas').toJSON(),
				'fee_types': erp_instance.ktv_sale.ktv_room_point.get('fee_types').toJSON(),
				'price_classes': erp_instance.ktv_sale.ktv_room_point.get('price_classes').toJSON(),
				'member_classes': erp_instance.ktv_sale.ktv_room_point.get('member_classes').toJSON(),
				'pay_types': erp_instance.ktv_sale.ktv_room_point.get('pay_types').toJSON(),
				'currency': erp_instance.ktv_sale.ktv_room_point.get('currency'),
				'format_amount': function(amount) {
					if (erp_instance.ktv_sale.ktv_room_point.get('currency').position == 'after') {
						return amount + ' ' + erp_instance.ktv_sale.ktv_room_point.get('currency').symbol;
					} else {
						return erp_instance.ktv_sale.ktv_room_point.get('currency').symbol + ' ' + amount;
					}
				},
			}));
		};
	};
	var _t = erp_instance.web._t;

	var widget = erp_instance.ktv_sale.widget = {};
	//定义基于bootstrap的modal的dialog类
	widget.BootstrapModal = erp_instance.web.OldWidget.extend(
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
	//roomWidget
	widget.RoomWidget = erp_instance.web.OldWidget.extend({
		tag_name: 'li',
		template_fct: qweb_template('room-template'),
		init: function(parent, options) {
			this._super(parent);
			this.model = options.model;
		},
		start: function() {
			this.model.bind('change', _.bind(this.render_element, this));
			this.$element.click(_.bind(this.on_click, this));
            //预定事件
            this.$element.find(".action_room_scheduled").click(_.bind(this.action_room_scheduled,this));
		},
        //包厢预定
        action_room_scheduled : function(){
            new widget.RoomScheduledWidget(null,{room : this.model,width : 450});
        },
        //当前包厢点击事件
		on_click: function() {
			erp_instance.ktv_sale.ktv_room_point.set({
				"current_room": this.model
			});
		},
		render_element: function() {
			this.$element.empty();
			this.$element.html(this.template_fct(this.model.export_as_json()));
		}
	});
	//房间列表
	widget.RoomListWidget = erp_instance.web.OldWidget.extend({
		init: function(parent, options) {
			this._super(parent);
			erp_instance.ktv_sale.ktv_room_point.get('display_rooms').bind('reset', this.render_element, this);
		},
		render_element: function() {
			this.$element.empty();
			erp_instance.ktv_sale.ktv_room_point.get('display_rooms').each(_.bind(function(r) {
				var r_widget = new widget.RoomWidget(null, {
					model: r
				});
				r_widget.appendTo(this.$element);
			},
			this), this);
			return this;
		}
	});
	//房态统计
	//RoomStatusWidget
	widget.RoomStatusWidget = erp_instance.web.OldWidget.extend({
		template_fct: qweb_template('room-status-template'),
		init: function(parent, options) {
			this._super(parent);
		},
		start: function() {
			//ktv_shop中的包厢数据发生变化时,重绘房态组件
			erp_instance.ktv_sale.ktv_room_point.bind('change:room_status', this.render_element, this);
		},
		render_element: function() {
			this.$element.empty();
			this.$element.html(this.template_fct(erp_instance.ktv_sale.ktv_room_point.get('room_status')));
			return this;
		}
	});

	//包厢过滤 widget
	widget.RoomFilterWidget = erp_instance.web.OldWidget.extend({
		template_fct: qweb_template('room-filter'),
		init: function(parent, options) {
			this._super(parent);
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
			var rooms = erp_instance.ktv_sale.ktv_room_point.get('all_rooms').toJSON();
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
			erp_instance.ktv_sale.ktv_room_point.get('display_rooms').reset(filtered_rooms);
		},

		render_element: function() {
			this.$element.html(this.template_fct({}));
			return this;
		}
	});

	//KtvRoomPointWidget
	widget.KtvRoomPointWidget = erp_instance.web.OldWidget.extend({
		init: function(parent, options) {
			this._super(parent);
		},
		start: function() {
			this.room_list_view = new widget.RoomListWidget();
			this.room_list_view.$element = $('#room_list');
			this.room_list_view.render_element();
			this.room_list_view.start();

			this.room_status_view = new erp_instance.ktv_sale.widget.RoomStatusWidget();
			this.room_status_view.$element = $('#room_status');
			this.room_status_view.render_element();
			this.room_status_view.start();

			//room filter
			this.room_filter_view = new erp_instance.ktv_sale.widget.RoomFilterWidget();
			this.room_filter_view.$element = $('#room_filter');
			this.room_filter_view.render_element();
			this.room_filter_view.start();

			//room info
			this.room_info_tab_view = new widget.RoomInfoWidget();
			this.room_info_tab_view.$element = $('#room_info_tab');
			this.room_info_tab_view.render_element();
			this.room_info_tab_view.start();
		}
	});

	//右侧显示的包厢信息对象
	widget.RoomInfoWidget = erp_instance.web.OldWidget.extend({
		template_fct: qweb_template('room-info-wrapper-template'),
		init: function(parent, options) {
			this._super(parent);
			erp_instance.ktv_sale.ktv_room_point.bind("change:current_room", this.render_element, this);
		},
		start: function() {},
		set_display_by_fee_type: function() {
			var self = this;
			//需要根据计费方式不同显示不同的费用信息
			var cur_room = erp_instance.ktv_sale.ktv_room_point.get("current_room");
			if (!cur_room) return false;

			var fee_type_id = cur_room.get("fee_type_id")[0];
			new erp_instance.web.Model("ktv.fee_type").get_func("read")(fee_type_id, ['id', 'fee_type_code', 'name']).pipe(function(fee_type) {

				self.$element.find(".room_fee,.minimum_fee,.minimum_fee_p,.buyout_fieldset,.buffet_fieldset,.buyout_config_lines,.buffet_config_lines,.buytime_fieldset,.hourly_fee_promotion_lines,.hourly_fee_lines,.member_hourly_fee_lines,.hourly_fee_p_lines").hide();
				//只收包厢费
				if (fee_type.fee_type_code == "only_room_fee") {
					self.$element.find(".room_fee").show();
				}
				//只收钟点费
				if (fee_type.fee_type_code == "only_hourly_fee") {
					self.$element.find(".hourly_fee,.hourly_fee_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}

				//钟点费+包厢费
				if (fee_type.fee_type_code == "room_fee_plus_hourly_fee") {
					self.$element.find(".room_fee,.hourly_fee,.hourly_fee_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}
				//最低消费
				if (fee_type.fee_type_code == "minimum_fee") {
					self.$element.find(".minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}

				//包厢费+最低消费
				if (fee_type.fee_type_code == "room_fee_plus_minimum_fee") {
					self.$element.find(".room_fee,.minimum_fee,.buytime_fieldset").show();
				}

				//钟点费+最低消费
				if (fee_type.fee_type_code == "hourly_fee_plus_minimum_fee") {
					self.$element.find(".hourly_fee_lines,.minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}

				//包厢费+钟点费+最低消费
				if (fee_type.fee_type_code == "room_fee_plus_hourly_fee_plus_minimum_fee") {
					self.$element.find(".room_fee,.hourly_fee,.hourly_fee_lines,.minimum_fee,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}
				//按位钟点费
				if (fee_type.fee_type_code == "hourly_fee_p") {
					self.$element.find(".hourly_fee_p_lines,.buytime_fieldset,.hourly_fee_promotion_lines").show();
				}

				//按位最低消费
				if (fee_type.fee_type_code == "minimum_fee_p") {
					self.$element.find(".minimum_fee_p").show();
				}
				//买断
				if (fee_type.fee_type_code == "buyout_fee") {
					self.$element.find(".buyout_config_lines,.buyout_fieldset").show();
					self.$element.find(".buytime_fieldset").hide();
				}
				//自助餐
				if (fee_type.fee_type_code == "buffet") {
					self.$element.find(".buffet_config_lines,.buffet_fieldset").show();
					self.$element.find(".buytime_fieldset").hide();
				}
			});
		},
		render_element: function() {
			var self = this;
			var the_room = erp_instance.ktv_sale.ktv_room_point.get("current_room");
			var the_room_fee_info = the_room.get_room_fee_info();
			the_room_fee_info.ready.then(function() {
				self.$element.html(self.template_fct({
					"room_info": the_room.export_as_json(),
					"room_fee_info": the_room_fee_info.export_as_json()
				}));
				self.set_display_by_fee_type();
			});
			return this;
		}
	});

	//预定widget
	widget.RoomScheduledWidget = widget.BootstrapModal.extend({
		template_fct: qweb_template('room-scheduled-form-template'),
		init: function(parent, options) {
			this.room = options.room;
			this.model = new erp_instance.ktv_sale.model.RoomScheduled({room_id : this.room.get("id")});
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
				rooms: erp_instance.ktv_sale.ktv_room_point.get_rooms_by_state('free').toJSON(),
				model: this.model.toJSON()
			}));
			return this;
		},
		//修改包厢
		on_change_room: function() {
			var changed_room = erp_instance.ktv_sale.ktv_room_point.get("rooms_all").get(this.$form.find('#room_id').val());
			this.room = changed_room;
            this.model.set({"room_id" : changed_room.get("id")});
		},
		//验证录入数据是否有效
		validate: function() {
			return this.$form.validate().form();
		},
		//保存预定信息
		save: function() {
            var self = this;
			if (!this.validate()) {
				return false;
			}
			//自界面获取各项值
			this.model.set(this.$form.form2json());
            var scheduled_time = this.$form.find("#scheduled_time").val();

            //var f_scheduled_time =  erp_instance.web.format_value(scheduled_time, {"widget": "datetime"});
            this.model.set({"scheduled_time" : scheduled_time});
            this.model.push().pipe(function(result){
                //更新包厢状态
                self.room.set(result);
                self.close();
            });
		}
	});
	//openerp的入口组件,用于定义系统的初始入口处理
	erp_instance.web.client_actions.add('ktv_room_pos.ui', 'erp_instance.ktv_sale.widget.MainRoomPointOfSale');
	widget.MainRoomPointOfSale = erp_instance.web.OldWidget.extend({
		init: function() {
			this._super.apply(this, arguments);
			if (erp_instance.ktv_sale.ktv_room_point) throw "ktv_room_point 已初始化.";
			erp_instance.ktv_sale.ktv_room_point = new erp_instance.ktv_sale.model.KtvRoomPoint();
		},
		start: function() {
			var self = this;
			return erp_instance.ktv_sale.ktv_room_point.ready.then(function() {
				self.render_element();
				erp_instance.ktv_sale.ktv_room_point.app = new erp_instance.ktv_sale.App(self.$element);
				self.$element.find(".btn-close").click(_.bind(self.stop, self));
				$('oe_toggle_secondary_menu').hide();
				$('#oe_secondary_menu').hide();
				$('.header').hide();
				$('.menu').hide();
				$('.oe_footer').hide();
			});
		},
		render: function() {
			return qweb_template("RoomPointOfSale")();
		},
		stop: function() {
			$('oe_toggle_secondary_menu').show();
			$('#oe_secondary_menu').show();
			$('.header').show();
			$('.menu').show();
			$('.oe_footer').show();
			erp_instance.ktv_sale.ktv_room_point = undefined;
			this._super();

		}
	});
};

