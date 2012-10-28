# -*- coding: utf-8 -*-
#会员时段特殊日设置
from osv import fields,osv

class member_hourly_fee_discount_special_day(osv.osv):
    '''会员时段特殊日设置'''
    _name = "ktv.member_hourly_fee_discount_special_day"
    _inherit = "ktv.room_type_special_day"
    _description = "会员时段殊日设置"

    _columns = {
            "member_class_id" : fields.many2one("ktv.member_class","member_class_id",required = True,help = "请选择会员类别"),
            }
