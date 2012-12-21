# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
_logger = logging.getLogger(__name__)

class member_hourly_fee_discount(osv.osv):
    '''会员钟点费优惠设置'''
    _name = "ktv.member_hourly_fee_discount"
    _inherit = "ktv.hourly_fee_discount"
    _description = "会员钟点费优惠设置"

    _columns ={
            'member_class_id' : fields.many2one('ktv.member_class',"member_class_id",required = True),
            }
