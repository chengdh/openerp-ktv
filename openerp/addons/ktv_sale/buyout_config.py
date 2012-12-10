# -*- coding: utf-8 -*-
#买断信息定义
import logging
from datetime import date,datetime
from osv import fields, osv
from tools.translate import _
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
            "thu_buyout_fee",
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
            "thu_buyout_enable",
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
            #FIXME 截止时间,感觉多余,不使用
            "break_on": fields.selection(ktv_helper.time_for_selection,"break_on",help="该固定时长买断每天截止时间，即使买断未到点，截止时间一到也即刻结束"),
            #FIXME 多余字段,将删除 是否启用截止时间
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

    def get_active_buyout_fee(self,cr,uid,buyout_config_id,context = None):
        '''
        获取当前有效的买断费用信息,需要判断如下情况
        1、当前日期是否在买断设置日期范围内
        2、当前时间是否在买断规定时间段内
        3、另:还需判断特殊日设置
        4、另:还需判断是否会员设置
        '''
        the_buyout_config = self.browse(cr,uid,buyout_config_id,context)
        s_day_ids = self.pool.get('ktv.buyout_config_special_day').search(cr,uid,[["room_type_id",'=',the_buyout_config.room_type_id.id]])
        s_days = self.pool.get('ktv.buyout_config_special_day').read(cr,uid,s_day_ids,['room_type_id','special_day'])
        s_days_list = [s_day['special_day'] for s_day in s_days]
        #判断日期
        #时间和日期都是utc时间
        context_now = ktv_helper.user_context_now(self,cr,uid)
        #判断是周几
        weekday_str = ktv_helper.weekday_str(context_now.weekday())

        buyout_fee = 0
        #判断是否特殊日期
        is_special_day = context_now.strftime("%Y-%m-%d") in s_days_list
        if is_special_day:
            buyout_fee = getattr(the_buyout_config,weekday_str + '_special_day_buyout_fee')

        #由于要和本地设置的time_from和time_to比较,此处需要得到context_timestamp
        context_time = context_now.strftime("%H:%M")

        buyout_enable = getattr(the_buyout_config,weekday_str + '_buyout_enable',False)
        in_time_range = context_time >= the_buyout_config.time_from and context_time <= the_buyout_config.time_to

        #以下情况下,引发异常
        #A 不是特殊日期设置
        #B 未启用买断设置 buyout_enable
        #C 不在日期时间范围内
        if (not is_special_day) and (not buyout_enable or not in_time_range):
            raise osv.except_osv(_("错误"), _('获取买断设置信息时失败.'))

        buyout_fee = getattr(the_buyout_config,weekday_str + "_buyout_fee")


        return {
                "room_type_id" : getattr(the_buyout_config,"room_type_id"),
                "name" : getattr(the_buyout_config,"name"),
                #起始时间是当前时间
                "time_from" : ktv_helper.user_context_now(self,cr,uid),
                #结束时间转换为datetime型
                "time_to" : ktv_helper.context_strptime(self,cr,uid,getattr(the_buyout_config,'time_to')),
                "is_member" : getattr(the_buyout_config,'is_member'),
                "buyout_fee" : buyout_fee,
                #计算实际买断分钟数量
                "buyout_time" : ktv_helper.context_now_minutes_delta(self,cr,uid,getattr(the_buyout_config,'time_to'))
                }
