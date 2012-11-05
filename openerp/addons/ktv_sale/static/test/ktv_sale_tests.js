$(document).ready(function() {
	var openerp;
	module("ktv sale tests", {
		setup: function() {
			openerp = window.openerp.init();
			window.openerp.web.core(openerp);
			window.openerp.web.chrome(openerp);
			window.openerp.web.data(openerp);
			window.openerp.ktv_sale(openerp);
            openerp.connection.bind();
		},
		teardown: function() {}
	});
	test("应能正确初始化ktv_sale_pos对象", function() {
		ktv_room_pos = new openerp.ktv_sale.KtvRoomPos(openerp.connection);
		ok(ktv_room_pos.store.get('ktv.fee_type').length > 0, "passed");
	});
});

