# -*- coding: utf-8 -*-
#自助餐定义
import logging
from datetime import date,datetime,time
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

    def get_active_configs(self,cr,uid,room_type_id):
        '''
        获取当前有效的买断设置信息
        :params integer room_type_id 包厢类型id
        :return array 符合条件的买断信息数组
        '''
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
        s_day_ids = self.pool.get('ktv.buffet_config_special_day').search(cr,uid,[("room_type_id",'=',room_type_id)])
        s_days = self.pool.get('ktv.buffet_config_special_day').read(cr,uid,s_day_ids,['room_type_id','special_day'])
        s_days_list = [s_day['special_day'] for s_day in s_days]

        #买断起止时间
        #time_from 当前时间
        #time_to 买断结束时间
        #如果当日是特殊日,则直接返回所有买断设置
        in_sp_day = datetime.today() in s_days_list
        #根据设置的星期是否有效来得到返回的设置
        for c in configs:
            buyout_enable = getattr(c,weekday_str + '_buyout_enable',False)
            in_time_range = ktv_helper.utc_time_between(c.time_from,c.time_to,now_str)
            time_from = datetime.now()
            time_to = ktv_helper.str_to_today_time(c.time_to)

            if  (in_sp_day and in_time_range) or (buyout_enable and in_time_range):
                buyout_fee = getattr(c,weekday_str + "_buyout_fee",0.0)
                child_buyout_fee = getattr(c,weekday_str + "_child_buyout_fee",0.0)
                if in_sp_day:
                    buyout_fee = getattr(c,"special_day_buyout_fee")
                    child_buyout_fee = getattr(c,"special_day_child_buyout_fee")
                ret.append({
                    "id" : c.id,
                    "room_type_id" : c.room_type_id.id,
                    "name" : getattr(c,"name"),
                    #起始时间是当前时间
                    "time_from" : time_from.strftime('%Y-%m-%d %H:%M:%S'),
                    "time_to" : time_to.strftime('%Y-%m-%d %H:%M:%S'),
                    "is_member" : getattr(c,'is_member'),
                    "buyout_fee" : buyout_fee,
                    "child_buyout_fee" : buyout_fee,
                    #计算实际买断分钟数量
                    "buyout_time" : (time_to.hour - time_from.hour)*60 + (time_to.minute - time_from.minute)
                    })
        return ret
