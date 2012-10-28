# -*- coding: utf-8 -*-
#自助餐特殊日设置
from osv import fields,osv

class buffet_config_special_day(osv.osv):
    '''自助餐特殊日设置'''
    _name = "ktv.buffet_config_special_day"
    _inherit = "ktv.room_type_special_day"
    _description = "自助餐特殊日设置"
