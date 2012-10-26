# -*- coding: utf-8 -*-
#买断特殊日设置
from osv import fields,osv

class buyout_config_special_day(osv.osv):
    '''买断特殊日设置'''
    _name = "ktv.buyout_config_special_day"
    _inherit = "ktv.room_type_special_day"
    _description = "买断特殊日设置"
