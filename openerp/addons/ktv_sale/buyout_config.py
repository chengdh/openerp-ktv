# -*- coding: utf-8 -*-
#买断信息定义
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper


_logger = logging.getLogger(__name__)

class buyout_config(osv.osv):
    """买断信息设置"""
    _name = "ktv.buyout_config"
    _description = "包厢买断信息设置"
    _fee_fields = [
            #周一
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
    _buyout_enable_fields = [
            #周一
            "mon_buyout_enable",
            #周二
            "tue_buyout_enable",
            #周三
            "wed_buyout_enable",
            #周四
            "thurs_buyout_enable",
            #周五
            "fri_buyout_enable",
            #周六
            "sat_buyout_enable",
            #周日
            "sun_buyout_enable",
            ]


    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({ field_name : fields.boolean(field_name) for field_name in _buyout_enable_fields})
    _columns.update({
            "name" : fields.char("name",size = 64,required = True),
            #包厢类别
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True,help="请选择包厢类别"),
            "is_member" : fields.boolean("is_member",help="是否是会员专用买断"),
            #买断时间限制
            "time_from": fields.selection(ktv_helper.time_for_selection,"time_from",required = True,help="买断起始时间" ),
            "time_to": fields.selection(ktv_helper.time_for_selection,"time_to",required = True,help="买断结束时间"),
            #截止时间
            "break_on": fields.selection(ktv_helper.time_for_selection,"break_on",help="该固定时长买断每天截止时间，即使买断未到点，截止时间一到也即刻结束"),
            #是否启用截止时间
            "break_on_enable" : fields.boolean("break_on_active"),
            #买断时长,以小时为单位
            "buyout_time" : fields.integer('buyout_time'),
            'active' : fields.boolean('active'),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({ field_name : True for field_name in _buyout_enable_fields})

    _defaults.update({
        "is_member" : False,
        "active" : True,
        })
