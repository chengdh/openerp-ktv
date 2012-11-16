# -*- coding: utf-8 -*-
#自助餐定义
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

__logger = logging.getLogger(__name__)

class buffet_config(osv.osv):
    '''自助餐设置'''
    _name = "ktv.buffet_config"
    _description = "自助餐设置"

    _inherit = "ktv.buyout_config"
    #儿童每人费用
    _child_fee_fields = [
            #周一
            "mon_child_buyout_fee",
            #周二
            "tue_child_buyout_fee",
            #周三
            "wed_child_buyout_fee",
            #周四
            "thu_child_buyout_fee",
            #周五
            "fri_child_buyout_fee",
            #周六
            "sat_child_buyout_fee",
            #周日
            "sun_child_buyout_fee",
            #特殊日
            "special_day_child_buyout_fee",
            ]

    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _child_fee_fields}

    _defaults = { field_name : 0 for field_name in _child_fee_fields}
