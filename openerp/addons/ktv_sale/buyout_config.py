# -*- coding: utf-8 -*-
#买断信息定义
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging
from PIL import Image

import netsvc
from osv import fields, osv
from tools.translate import _
from decimal import Decimal
import decimal_precision as dp
import ktv_helper


_logger = logging.getLogger(__name__)

class buyout_config(osv.osv):
    """买断信息设置"""
    _name = "ktv.buyout_config"
    _discription = "包厢买断信息设置"
    _fee_fields = [
            "mon_buyout_fee",
            #周二
            "tue_buyout_fee",
            #周三
            "wed_buyout_fee",
            #周四
            "thurs_buyout_fee",
            #周五
            "fri_buyout_fee",
            #周六
            "sat_buyout_fee",
            #周日
            "sun_buyout_fee",
            #特殊日
            "special_day_buyout_fee",
            ]

    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({
            "name" : fields.char("name",size = 64,required = True),
            #包厢类别
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True,help="请选择包厢类别"),
            #买断时间限制
            "time_from": fields.selection(ktv_helper.time_for_selection,"time_from",required = True,help="买断起始时间" ),
            "time_to": fields.selection(ktv_helper.time_for_selection,"time_to",required = True,help="买断结束时间"),
            "is_member" : fields.boolean("is_member",help="是否是会员专用买断"),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({
        "is_member" : False,
        })

    #包厢类别发生变化,基准价格同样改变
    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.room_type').browse(cr, uid, room_type_id)
        vals = self._reset_buyout_fee(room_type.hourly_fee)
        return {"value" : vals}

    #重新设置各天费用为100%
    def _reset_buyout_fee(self,buyout_fee = 0):
        vals = {field_name : buyout_fee for field_name in self._fee_fields }
        return vals


