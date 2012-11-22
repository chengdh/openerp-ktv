$(document).ready(function() {
    var openerp;
    module("ktv_sale model 测试", {
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
    test("应能正确获取fee_type对象", function() {
        var fee_types = new openerp.ktv_sale.model.FeeTypeCollection();
        openerp.ktv_sale.model.FeeType.fetch().pipe(function(result) {
            fee_types.add(result);
            ok(fee_types.length > 0);
        });
    });
    test("应能够正确获取房态",function(){
        var ktv_room_point = new openerp.ktv_sale.model.KtvRoomPoint();
        openerp.ktv_sale.model.Room.fetch().pipe(function(result){
            var rooms = new openerp.ktv_sale.model.RoomCollection(result);
            ktv_room_point.set({rooms : rooms});
            ok(ktv_room_point.get('room_status')['free'] > 0);
        });
    });
    test("应能够正确初始话RoomFeeInfo对象",function(){
    });
});


