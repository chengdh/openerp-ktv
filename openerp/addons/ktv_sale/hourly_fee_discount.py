# -*- coding: utf-8 -*-
import logging
from datetime import date,datetime,time
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
            "thu_hourly_fee",
            "thu_hourly_discount",
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
            "time_from": fields.time("time_from",required = True ),
            #打折消费时间结束值
            "time_to": fields.time("time_to",required = True),
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

    def get_active_configs(self,cr,uid,room_type_id,context=None):
        """
        获取当前有效的钟点费打折设置信息
        :params room_type_id integer 包厢类别id M
        :params context['price_class_id'] integer 价格类别id O
        :params context['member_class_id'] integer 会员类别id O
        :return array 有效的钟点费打折信息数组
        """
        ret = []
        #1 获取所有钟点费打折信息,并逐个进行判断
        domain = [["room_type_id","=",room_type_id]]
        price_class_id = context and "price_class_id" in context and context['price_class_id']
        if price_class_id:
            domain.append(["price_class_id","=",price_class_id])
        member_class_id = context and "member_class_id" in context and context['member_class_id']
        if member_class_id:
            domain.append(["member_class_id","=",member_class_id])

        ids = self.search(cr,uid,domain)
        configs = self.browse(cr,uid,ids)
        #2 判断当日设置是否启用
        context_now = ktv_helper.user_context_now(self,cr,uid)
        #判断是周几
        weekday_str = ktv_helper.weekday_str(context_now.weekday())
        now_str = datetime.now().strftime("%H:%M:00")
        #判断特殊日设置
        which_fee =  context and 'which_fee' in context and context['which_fee'] or "hourly_fee_discount"
        osv_name = "ktv.%s_special_day" % which_fee
        s_day_ids = self.pool.get(osv_name).search(cr,uid,[("room_type_id",'=',room_type_id)])
        s_days = self.pool.get(osv_name).read(cr,uid,s_day_ids,['room_type_id','special_day'])
        s_days_list = [s_day['special_day'] for s_day in s_days]

        #如果当日是特殊日,则直接返回所有买断设置
        in_sp_day = datetime.today() in s_days_list
        #根据设置的星期是否有效来得到返回的设置
        for c in configs:
            in_time_range = ktv_helper.utc_time_between(c.time_from,c.time_to,now_str)
            #是否忽略时间段判断,用于显示全天的钟点费打折信息
            ignore_time_range = context and 'ignore_time_range' in context and context['ignore_time_range']
            if ignore_time_range:
                in_time_range = True
            if  (in_sp_day and in_time_range) or in_time_range:
                hourly_fee = getattr(c,weekday_str + "_hourly_fee",0.0)
                hourly_discount = getattr(c,weekday_str + "_hourly_discount",0.0)
                if in_sp_day:
                    hourly_fee = getattr(c,"special_day_hourly_fee")
                    hourly_discount = getattr(c,"special_day_hourly_discount")

                ret.append({
                    "id" : c.id,
                    "price_class_id" : c.price_class_id.id,
                    "room_type_id" : c.room_type_id.id,
                    "time_from" : c.time_from,
                    "time_to" : c.time_to,
                    "hourly_fee" : hourly_fee,
                    "hourly_discount" : hourly_discount,
                    })
        return ret


