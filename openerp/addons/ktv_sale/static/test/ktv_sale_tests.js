$(document).ready(function() {
	var openerp;
    var room_pos;
    var rooms_collection;
	module("ktv sale tests", {
		setup: function() {
			openerp = window.openerp.init();
			window.openerp.web.core(openerp);
			window.openerp.web.chrome(openerp);
			window.openerp.web.data(openerp);
			window.openerp.ktv_sale(openerp);
			openerp.connection.bind();
			room_pos = openerp.ktv_sale.ktv_room_pos = new openerp.ktv_sale.KtvRoomPos(openerp.connection);
            var rooms = room_pos.store.get('ktv.room');
            rooms_collection = new openerp.ktv_sale.RoomCollection(rooms);
		},
		teardown: function() {}
	});
	test("应能正确初始化ktv_sale_pos对象", function() {
		ok(room_pos.store.get('ktv.fee_type').length > 0);
	});

	test("ktv.room属性发生变化时,应自动更新localstorage中对应的room属性", function() {
        var rooms = room_pos.store.get('ktv.room');
		var rooms_collection = new openerp.ktv_sale.RoomCollection(rooms);
		var room = rooms_collection.at(0);
        console.debug("原包厢名称:" + room.get("name"));
		room.set({
			'name': 'test_room'
		});
        updated_rooms = JSON.parse(localStorage["oe_ktv_ktv.room"]);
        ret = _.any(updated_rooms,function(r) {return r.name == "test_room"});
		ok(ret);
	});

    test("db.ktv_sale.get_state_desc",function(){
        ok(openerp.ktv_sale.room_state.get_state_desc('free') == "空闲")
    });

    test('应能正确处理订房操作',function(){
        var the_room = rooms_collection.at(0);
        var room_scheduled = new openerp.ktv_sale.RoomScheduled();
        room_scheduled.set({
            guest_name : "张三",
            guest_phone : "13676997527",
            scheduled_time : new Date()
        });
        ret = the_room.save_room_scheduled(room_scheduled);
        ok(ret);
    });
});

