# -*- coding: utf-8 -*-
#会员等级
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

class member_class(osv.osv):
    '''会员等级设置'''
    _name = "ktv.member_class"
    _description = "会员等级设置"

    _columns = {
            "name" : fields.char("name",size = 64,required = True),
            'card_fee' : fields.float('card_fee',digits_compute = dp.get_precision('Ktv Fee'),help = "制卡费"),
            'drinks_fee_discount' : fields.float('drinks_fee_discount',digits_compute = dp.get_precision('Ktv Fee'),help = "酒水费折扣%%"),
            'room_fee_discount' : fields.float('room_fee_discount',digits_compute = dp.get_precision('Ktv Fee'),help = "房费折扣%%"),
            'up_card_fee' : fields.float('up_card_fee',digits_compute = dp.get_precision('Ktv Fee'),help = "补卡费用"),
            'drinks_price_type' : fields.selection(ktv_helper.price_list_for_selection,string="drinks_price_type",help = "酒水价格",required = True),
            'room_limit_count' : fields.integer('room_limit_count',help = "房费结算时,限制每天使用的次数,0为不限制"),
            'market_limit_count' : fields.integer('market_limit_count',help = "超市消费结算时,限制每天使用的次数,0为不限制"),
            'can_points' : fields.boolean('can_points',help="即该等级会员卡是否允许积分"),
            'can_manual_input' : fields.boolean('can_manual_input',help="该等级会员卡在刷卡时是否允许切换成手工输入方式输入卡号"),
            'can_store_money' : fields.boolean('can_store_money',help="该卡是否可以储值"),
            'active' : fields.boolean('active',help="有效标志"),
            }

    _defaults = {
            'card_fee' : 0,
            'drinks_fee_discount' : 0,
            'room_fee_discount' : 0,
            'up_card_fee' : 0,
            'room_limit_count' : 0,
            'market_limit_count' : 0,
            'can_points' : True,
            'can_manual_input' : True,
            'can_store_money' : True,
            'active' : True,
            }
