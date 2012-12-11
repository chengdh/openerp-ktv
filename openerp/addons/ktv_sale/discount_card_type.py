# -*- coding: utf-8 -*-
#打折卡类别设置
from osv import fields, osv
import ktv_helper
import decimal_precision as dp

class discount_card_type(osv.osv):
    _name = "ktv.discount_card_type"
    _description = "打折卡类别信息设置"

    _columns = {
            'name' : fields.char('name',size = 64,required = True),
            #酒水折扣,按照百分比计算
            'drinks_fee_discount' : fields.float('drinks_fee_discount',digits_compute = dp.get_precision('Ktv Fee')),
            #房费折扣,按照百分比计算
            'room_fee_discount' : fields.float('room_fee_discount',digits_compute = dp.get_precision('Ktv Fee')),
            #制卡费用
            'card_fee' : fields.float('card_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #描述
            'description' : fields.text('description',size = 255),
            'active' : fields.boolean('active'),

            }
    _defaults = {
            'drinks_fee_discount' : 100.00,
            'room_fee_discount' : 100.00,
            'card_fee' : 0.0,
            'active' : True
            }
