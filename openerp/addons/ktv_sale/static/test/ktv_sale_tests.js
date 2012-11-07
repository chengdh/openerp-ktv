$(document).ready(function() {
	var openerp;
    var ktv_room_pos;
	module("ktv sale tests", {
		setup: function() {
			openerp = window.openerp.init();
			window.openerp.web.core(openerp);
			window.openerp.web.chrome(openerp);
			window.openerp.web.data(openerp);
			window.openerp.ktv_sale(openerp);
			openerp.connection.bind();
			ktv_room_pos = openerp.ktv_sale.ktv_room_pos = new openerp.ktv_sale.KtvRoomPos(openerp.connection);
		},
		teardown: function() {}
	});
	test("应能正确初始化ktv_sale_pos对象", function() {
		ok(ktv_room_pos.store.get('ktv.fee_type').length > 0);
	});

	test("ktv.room属性发生变化时,应自动更新localstorage中对应的room属性", function() {
        rooms = ktv_room_pos.store.get('ktv.room');
		var rooms_collection = new openerp.ktv_sale.RoomCollection(rooms);
		var room = rooms_collection.at(0);
		room.set({
			'name': 'test_room'
		});
        room_name = ktv_room_pos.store.get('ktv.room')[0]['name'];
		ok( room_name == 'test_room');
	});
});

