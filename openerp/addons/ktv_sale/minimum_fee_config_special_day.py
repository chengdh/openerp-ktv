# -*- coding: utf-8 -*-
#时段低消特殊日设置
from osv import fields,osv

class minimum_fee_config_special_day(osv.osv):
    '''时段低消特殊日设置'''
    _name = "ktv.minimum_fee_config_special_day"
    _description = "时段低消特殊日设置"
    _inherit = "ktv.room_type_special_day"
