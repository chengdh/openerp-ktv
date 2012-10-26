# -*- coding: utf-8 -*-
#时段最低消费设置
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper


_logger = logging.getLogger(__name__)

class minimum_fee_config(osv.osv):
    """针对收取最低消费的量贩KTV而言,可能存在不同时段其包厢的不一样，在此可以对包厢设置不同时段的最低消费、包厢费、按位低销及开房套餐等参数，系统按时间自动选取场次对应的设置"""
    _name = "ktv.minimum_fee_config"
    _description = "时段低消设置"
    _fee_fields = [
            "mon_minimum_fee",
            "mon_room_fee",
            "mon_minimum_fee_p",
            "tue_minimum_fee",
            "tue_room_fee",
            "tue_minimum_fee_p",
            "wed_minimum_fee",
            "wed_room_fee",
            "wed_minimum_fee_p",
            "thurs_minimum_fee",
            "thurs_room_fee",
            "thurs_minimum_fee_p",
            "fri_minimum_fee",
            "fri_room_fee",
            "fri_minimum_fee_p",
            "sat_minimum_fee",
            "sat_room_fee",
            "sat_minimum_fee_p",
            "sun_minimum_fee",
            "sun_room_fee",
            "sun_minimum_fee_p",
            "special_day_minimum_fee",
            "special_day_room_fee",
            "special_day_minimum_fee_p",
            ]
    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({
            #包厢类别
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True),
            #打折时间限制
            "time_from": fields.selection(ktv_helper.time_for_selection,"time_from",required = True ),
            #打折消费时间结束值
            "time_to": fields.selection(ktv_helper.time_for_selection,"time_to",required = True),
            "active" : fields.boolean("active"),
            })
    _defaults = {"active" : True}
    _defaults.update({ field_name : 0 for field_name in _fee_fields})
