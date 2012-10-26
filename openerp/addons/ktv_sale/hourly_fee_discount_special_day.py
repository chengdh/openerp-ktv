# -*- coding: utf-8 -*-
#钟点费特殊日设置
from osv import fields,osv

class hourly_fee_discount_special_day(osv.osv):
    '''钟点费特殊日设置'''
    _name = "ktv.hourly_fee_discount_special_day"
    _description = "钟点费特殊日设置"
    _inherit = "ktv.room_type_special_day"
