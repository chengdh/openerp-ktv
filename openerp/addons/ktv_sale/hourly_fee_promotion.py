# -*- coding: utf-8 -*-
#买钟优惠设置
from datetime import date,datetime,time
from osv import fields,osv
import ktv_helper

class hourly_fee_promotion(osv.osv):
    '''买钟优惠设置'''
    _name = "ktv.hourly_fee_promotion"
    _description = "买钟优惠设置"

    _columns = {
            "name" : fields.char("name",size = 64,required = True),
            "description" : fields.text("description",size = 255),
            "active" : fields.boolean("active"),
            "is_member" : fields.boolean("is_member",help = "是否会员专属优惠"),
            "buy_minutes" : fields.integer("buy_minutes",help = "买钟时长(分钟)"),
            "present_minutes" :fields.integer("present_minutes",help = "赠送时长(分钟)"),
            "active_datetime_limit" : fields.boolean("active_datetime_limit",help = "是否启用日期区间限制"),
            "datetime_from" : fields.datetime("datetime_from",help = "起始日期"),
            "datetime_to" : fields.datetime('datetime_to',help = "结束日期"),
            "active_time_limit" : fields.boolean("active_time_limit",help = "是否启用时间段限制"),
            "time_from" : fields.time("time_from",help = "起始时间"),
            "time_to" : fields.time("time_to",help = "结束时间"),
            #暂不启用以下字段
            "active_break_on_time" :  fields.boolean("active_break_on_time",help = "启用优惠截止时间"),
            "break_on_time" : fields.time("break_on_time",help = "优惠截止时间"),
            #
            "mon_active": fields.boolean("mon_active"),
            "tue_active": fields.boolean("tue_active"),
            "wed_active": fields.boolean("wed_active"),
            "thu_active": fields.boolean("thu_active"),
            "fri_active": fields.boolean("fri_active"),
            "sat_active": fields.boolean("sat_active"),
            "sun_active": fields.boolean("sun_active"),
            }

    _defaults = {
            "is_member" : False,
            "active" : True,
            "active_datetime_limit" : False,
            "active_time_limit" : False,
            "active_break_on_time" : False,
            "mon_active": True,
            "tue_active": True,
            "wed_active": True,
            "thu_active": True,
            "fri_active": True,
            "sat_active": True,
            "sun_active": True,
            }
    def get_active_configs(self,cr,uid):
        """
        获取当前有效的买钟优惠设置信息
        """
        #默认情况下,所有设置都起效
        ret = []
        ids = self.search(cr,uid,[])
        configs = self.browse(cr,uid,ids)

        context_now = ktv_helper.user_context_now(self,cr,uid)
        #判断是周几
        weekday_str = ktv_helper.weekday_str(context_now.weekday())
        time_now_str = datetime.now().strftime("%H:%M:00")

        datetime_now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        for c in configs:
            json_c = {
                    "id": c.id,
                    "name" : c.name,
                    "is_member" : c.is_member,
                    "buy_minutes": c.buy_minutes,
                    "present_minutes": c.present_minutes,
                    "active_datetime_limit" : c.active_datetime_limit,
                    "datetime_from" : c.datetime_from,
                    "datetime_to" : c.datetime_to,
                    "active_time_limit": c.active_time_limit,
                    "time_from": c.time_from,
                    "time_to": c.time_to,

                    }
            #判断是否在日期区间内
            if c.active_datetime_limit and (not datetime_now_str >= c.datetime_from or not datetime_now_str <= c.datetime_to):
                json_c = None
            #判断是否在时间区间内
            if c.active_time_limit and ktv_helper.htc_time_between(c.time_from,c.time_to,time_now_str):
                json_c = None
            #判断是否启用了星期设置
            if c.mon_active or c.tue_active or c.wed_active or c.thu_active or c.fri_active or c.sat_active or c.sun_active:
                if not getattr(c,"%s_active" % weekday_str):
                    json_c = None
            ret.append(json_c)
            return ret
