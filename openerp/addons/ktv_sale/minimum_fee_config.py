# -*- coding: utf-8 -*-
#时段最低消费设置
import logging
from datetime import date,datetime,time
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
            "thu_minimum_fee",
            "thu_room_fee",
            "thu_minimum_fee_p",
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
            "time_from": fields.time("time_from",required = True ),
            #打折消费时间结束值
            "time_to": fields.time("time_to",required = True),
            "active" : fields.boolean("active"),
            })
    _defaults = {"active" : True}
    _defaults.update({ field_name : 0 for field_name in _fee_fields})


    def get_active_configs(self,cr,uid,room_type_id):
        """
        获取当前设定的包厢类别可用的低消设置信息
        params: room_type_id integer 包厢类别id
        return: array 符合条件的低消设置信息
        """
        ret = []
        #1 获取所有买断信息,并逐个进行判断
        ids = self.search(cr,uid,[("room_type_id",'=',room_type_id)])
        configs = self.browse(cr,uid,ids)
        #2 判断当日买断是否启用
        context_now = ktv_helper.user_context_now(self,cr,uid)
        #判断是周几
        weekday_str = ktv_helper.weekday_str(context_now.weekday())
        now_str = datetime.now().strftime("%H:%M:00")
        #判断特殊日设置
        s_day_ids = self.pool.get('ktv.minimum_fee_config_special_day').search(cr,uid,[("room_type_id",'=',room_type_id)])
        s_days = self.pool.get('ktv.minimum_fee_config_special_day').read(cr,uid,s_day_ids,['room_type_id','special_day'])
        s_days_list = [s_day['special_day'] for s_day in s_days]

        #如果当日是特殊日,则直接返回所有买断设置
        in_sp_day = datetime.today() in s_days_list
        #根据设置的星期是否有效来得到返回的设置
        for c in configs:
            in_time_range = ktv_helper.utc_time_between(c.time_from,c.time_to,now_str)
            if  (in_sp_day and in_time_range) or in_time_range:
                room_fee = getattr(c,weekday_str + "_room_fee",0.0)
                minimum_fee = getattr(c,weekday_str + "_minimum_fee",0.0)
                minimum_fee_p = getattr(c,weekday_str + "_minimum_fee_p",0.0)
                if in_sp_day:
                    room_fee = getattr(c,"special_day_room_fee",0.0)
                    minimum_fee = getattr(c,"special_day_minimum_fee",0.0)
                    minimum_fee_p = getattr(c,"special_day_minimum_fee_p",0.0)
                ret.append({
                    "id" : c.id,
                    "room_type_id" : c.room_type_id.id,
                    "room_fee" : room_fee,
                    "minimum_fee" : minimum_fee,
                    "minimum_fee_p" : minimum_fee_p,
                    })
        return ret
