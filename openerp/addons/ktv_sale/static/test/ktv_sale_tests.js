$(document).ready(function() {
    var openerp;
    var room_pos;
    var rooms_collection;
    //原始的包厢信息.从localStorage中获取到的
    var rooms;
    module("ktv sale tests", {
        setup: function() {
            openerp = window.openerp.init();
            window.openerp.web.core(openerp);
            window.openerp.web.chrome(openerp);
            window.openerp.web.data(openerp);
            window.openerp.ktv_sale(openerp);
            openerp.connection.bind();
            room_pos = openerp.ktv_sale.ktv_room_pos = new openerp.ktv_sale.KtvRoomPos(openerp.connection);
            room_pos.set_app_data();
            //清空缓存的操作对象
            room_pos.set({'pending_operations' : null});
            room_pos.store.set({'ktv.room_operate' : null});
        },
        teardown: function() {}
    });
    test("应能正确初始化ktv_sale_pos对象", function() {
        ok(room_pos.store.get('ktv.fee_type').length > 0);
    });

    test("ktv.room属性发生变化时,应自动更新localstorage中对应的room属性", function() {
        console.debug("execute test update room in localStorage");
        var room = room_pos.rooms_all.at(0);
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
        var the_room = room_pos.rooms_all.at(0);
        var room_scheduled = new openerp.ktv_sale.RoomScheduled();
        room_scheduled.set({
            guest_name : "张三",
            guest_phone : "13676997527",
            scheduled_time : new Date()
        });
        ret = the_room.save_room_scheduled(room_scheduled);
        ok(ret);
    });
    test('应能够正确获取房态信息',function(){
        var ktv_shop = new openerp.ktv_sale.KtvShop();
        ktv_shop.get("rooms").reset(room_pos.rooms_all.export_as_json());
        //目前所有包厢应全部是空闲状态
        ok(ktv_shop.get("room_status")["free"]  > 0);
    });


    test('应能够正确保存开房信息',function(){
        var the_room = room_pos.rooms_all.at(1);
        var room_open = new openerp.ktv_sale.RoomOpen();
        room_open.set({
            saler_id : 1,     //销售经理
            fee_type_id : 1,  //计费方式
            room_fee : 100,  //包厢费
            minimum_fee : 0,  //最低消费
            minimum_fee_p : 0, //最低消费按人
            base_minimum_fee : 70,  //原最低消费
            base_minimum_fee_p : 70,  //原最低消费按人
            base_hourly_fee_p : 30, //原按人钟点费

            base_hourly_fee : 70,  //原钟点费
            base_hourly_fee_p : 30, //原按人钟点费

            hourly_fee : 50,  //折后钟点费
            hourly_fee_discount : 0.5, //钟点费折扣
            hourly_fee_p : 20,  //折后钟点费按人
            hourly_fee_discount : 0.5,  //钟点费折扣按人
            member_card_id : 1, //会员卡id
            drinks_fee_discount : 0.5, //会员卡酒水折扣
            room_fee_discount : 0.8, //房费折扣
            guest_name : "张三",  //客人姓名
            person_count : 10  //客人人数

        });
        ret = the_room.save_room_open(room_open);
        ok(ret);
    });
    test("应能正常初始化RoomFeeInfo对象",function(){
        var the_room =  room_pos.rooms_all.at(0);
        var room_fee_info = new openerp.ktv_sale.RoomFeeInfo({"room" : the_room});
        ok(room_fee_info.get("room_fee") > 0);
        ok(room_fee_info.current_room_fee() > 0);
        ok(room_fee_info.export_as_json());
    });
    module("ktv 收银系统 qweb模板测试", {
        setup: function() {
            openerp = window.openerp.init();
            window.openerp.web.core(openerp);
            window.openerp.web.chrome(openerp);
            window.openerp.web.data(openerp);
            window.openerp.ktv_sale(openerp);
            openerp.connection.bind();
            room_pos = openerp.ktv_sale.ktv_room_pos = new openerp.ktv_sale.KtvRoomPos(openerp.connection);
            room_pos.set_app_data();
            //清空缓存的操作对象
            room_pos.set({'pending_operations' : null});
            room_pos.store.set({'ktv.room_operate' : null});
            openerp.web.qweb.add_template('../src/xml/ktv_sale.xml');
        },
        teardown: function() {
            openerp.web.qweb.templates = [];
            openerp.web.qweb.tag = {};
            openerp.web.qweb.att = {};

        }
    });

    test('应能正常显示预定界面',function() {
        var room = room_pos.rooms_all.at(2);
        var room_scheduled_widget = new openerp.ktv_sale.RoomScheduledWidget(null,{show : false,room : room});
        ok(room_scheduled_widget.$element);
    });

    test("应能正常显示开房界面",function(){
        var room = room_pos.rooms_all.at(3);
        var w = new openerp.ktv_sale.RoomOpenWidget(null,{show : false,room : room});
        w.$element = $('#ktv_widget');
        w.render_element();
        w.start();
        ok(w.$element);
    });
    test("应能正确显示包厢费用列表",function(){
    });

});

