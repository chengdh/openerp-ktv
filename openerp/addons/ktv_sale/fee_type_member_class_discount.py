# -*- coding: utf-8 -*-
#计费方式-会员等级折扣
#如未对“会员等级”针对“计费方式”设置折扣,则默认取该会员等级预设的折扣。
from osv import fields, osv
import ktv_helper
import decimal_precision as dp

class fee_type_member_class_discount(osv.osv):
    _name = "ktv.fee_type_member_class_discount"
    _description = "计费方式-会员等级折扣"

    _columns = {
            'fee_type_id' : fields.many2one("ktv.fee_type","fee_type_id",required = True,help = "计费方式"),
            #会员等级
            'member_class_id' : fields.many2one('ktv.member_class','member_class_id',required = True,help = "预定义的会员等级"),
            #酒水折扣
            'drinks_fee_discount' : fields.float('drinks_fee_discount',digits_compute = dp.get_precision('Ktv Fee')),
            #房费折扣
            'room_fee_discount' : fields.float('room_fee_discount',digits_compute = dp.get_precision('Ktv Fee')),
            }
    _defaults = {
            'drinks_fee_discount' : 100.00,
            'room_fee_discount' : 100.00,
            }


