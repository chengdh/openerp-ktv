# -*- coding: utf-8 -*-
from osv import osv,fields
import decimal_precision as dp
import ktv_helper

class room_opens(osv.osv):
    '''
    包厢开房对象,包括预定转开房和空置转开房
    '''

    _name = "ktv.room_opens"

    _description = "开房信息"

    _columns = {
            "room_operate_id" : fields.many2one('ktv.room_operate',"room_operate_id",required = True),
            "open_time" : fields.datetime('open_time',required = True,readonly = True,help = "开房时间"),
            "saler_id" : fields.many2one('res.users','saler_id',help = "销售经理"),
            "fee_type_id" : fields.many2one("ktv.fee_type","fee_type_id",required = True,help = "计费方式"),
            "price_class_id" : fields.many2one("ktv.price_class","price_class_id",required = True,help = "价格类型"),
            "pre_pay_fee" : fields.float("pre_pay_fee",digits_compute = dp.get_precision("Ktv Fee")),
            "member_id"
            "room_fee_discount" : fields.float("room_fee_discount",digits_compute = dp.get_precision("Ktv Fee")),
            "drinks_price_type" : fields.selection(price_list_for_selection,"drinks_price_type",help = "酒水价格"),
            "drinks_fee_discount" :  fields.float("drinks_fee_discount",digits_compute = dp.get_precision("Ktv Fee")),
            "guest_name" : fields.char("guest_name",size = 64),
            "persons_count" : fields.integer("persons_count"),
            #TODO 会员赠送
            #TODO 开房配送
            }


