//ktv_sale入口
openerp.ktv_sale = function(erp_instance){
    //全局ktv_room_point对象
    erp_instance.ktv_sale ={};
    openerp.ktv_sale.helper(erp_instance);
    openerp.ktv_sale.model(erp_instance);
    openerp.ktv_sale.widget(erp_instance);
    erp_instance.ktv_sale.ktv_room_point = null;
	//App,初始化各种widget,并定义widget之间的交互
	erp_instance.ktv_sale.App = (function() {
		function App($element) {
			this.initialize($element);
		};
		App.prototype.initialize = function($element) {
			this.ktv_room_point_view = new erp_instance.ktv_sale.widget.KtvRoomPointWidget();
			this.ktv_room_point_view.$element = $element;
			this.ktv_room_point_view.start();
		};
        App.prototype.alert = function(options){
            var alert = new erp_instance.ktv_sale.widget.AlertWidget(null,options);
            alert.appendTo($('.alert-wrapper'));
        }
		return App;
	})();
}
