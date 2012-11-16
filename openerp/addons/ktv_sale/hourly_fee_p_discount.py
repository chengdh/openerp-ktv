# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
_logger = logging.getLogger(__name__)

class hourly_fee_p_discount(osv.osv):
    '''按位钟点费优惠设置'''
    _name = "ktv.hourly_fee_p_discount"
    _inherit = "ktv.hourly_fee_discount"
    _description = "按位钟点费优惠设置"
