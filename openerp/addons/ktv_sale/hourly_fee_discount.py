# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
from decimal import Decimal
import decimal_precision as dp
import ktv_helper

_logger = logging.getLogger(__name__)


class hourly_fee_discount(osv.osv):
    """包厢钟点费打折设置,设置包厢每周各天的钟点费打折情况"""
    _name = "ktv.hourly_fee_discount"
    _description = "包厢钟点费打折设置,设置包厢每周各天的钟点费打折情况"
    #费用字段定义
    #其中discount字段存储的是百分比
    _fee_fields = [
            "mon_hourly_fee",
            "mon_hourly_discount",
            #周二
            "tue_hourly_fee",
            "tue_hourly_discount",
            #周三
            "wed_hourly_fee",
            "wed_hourly_discount",
            #周四
            "thurs_hourly_fee",
            "thurs_hourly_discount",
            #周五
            "fri_hourly_fee",
            "fri_hourly_discount",
            #周六
            "sat_hourly_fee",
            "sat_hourly_discount",
            #周日
            "sun_hourly_fee",
            "sun_hourly_discount",
            #特殊日
            "special_day_hourly_fee",
            "special_day_hourly_discount",
            ]

    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({
            #价格类型
            "price_class_id" : fields.many2one("ktv.price_class","price_class_id",required = True),
            #包厢类别
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True),
            #打折时间限制
            "time_from": fields.selection(ktv_helper.time_for_selection,"time_from",required = True ),
            #打折消费时间结束值
            "time_to": fields.selection(ktv_helper.time_for_selection,"time_to",required = True),
            #打折参考的基准价格,默认等于该包厢类别room_type的钟点费,用户可以修改
            "base_hourly_fee" : fields.float("base_hourly_fee", digits_compute= dp.get_precision('Ktv Room Default Precision')),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({
        #打折参考的基准价格,默认等于该包厢类别room_type的钟点费,用户可以修改
        "base_hourly_fee" : 0,
        })

    #包厢类别发生变化,基准价格同样改变
    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.room_type').browse(cr, uid, room_type_id)
        vals = self._reset_discount_info(room_type.hourly_fee)
        vals.update({"base_hourly_fee" : room_type.hourly_fee})
        return {"value" : vals}

    #重新设置各天费用为100%
    def _reset_discount_info(self,base_hourly_fee = 0):
        vals = {field_name : base_hourly_fee for field_name in self._fee_fields if field_name.find("fee") != -1}
        vals.update({field_name : 100.0 for field_name in self._fee_fields if field_name.find("discount") != -1})
        return vals

    #基准钟点费发生变换时,充值所有打折数据
    def onchange_base_hourly_fee(self,cr,uid,ids,base_hourly_fee):
        if base_hourly_fee and base_hourly_fee == 0 :
            return {}
        vals = self._reset_discount_info(base_hourly_fee)
        return {"value" : vals}

    #钟点费或钟点费折扣互为变化
    #context中传递了变化的字段
    def onchange_hourly_fee(self,cr,uid,ids,field_name = False,hourly_fee_or_discount_rate = False ,base_hourly_fee = False,context = None):
        val ={}
        if not base_hourly_fee or not field_name :
            return {}
        #如果是修改钟点费,则自动计算折扣百分比
        precision_discount = self.pool.get('decimal.precision').precision_get(cr, uid, 'Ktv Fee Discount Rate')
        precision_fee = self.pool.get('decimal.precision').precision_get(cr, uid, 'Ktv Fee')
        if field_name.find("hourly_fee") != -1 :
            to_change_fieldname = field_name.replace('fee','discount')
            val[to_change_fieldname] = round(Decimal(hourly_fee_or_discount_rate) / Decimal(base_hourly_fee) * 100,precision_discount)

        #如果是修改钟点费折扣,则自动计算折扣后的钟点费
        if field_name.find("hourly_discount") != -1 :
            to_change_fieldname = field_name.replace('discount','fee')
            val[to_change_fieldname] = round(Decimal(base_hourly_fee) * Decimal(hourly_fee_or_discount_rate) / 100,precision_fee)
        return {"value" : val}
