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
            "time_from": fields.time("time_from",required = True,help="买断起始时间" ),
            "time_to": fields.time("time_to",required = True,help="买断结束时间"),
            #FIXME 截止时间,感觉多余,不使用
            "break_on": fields.time("break_on",help="该固定时长买断每天截止时间，即使买断未到点，截止时间一到也即刻结束"),
            #FIXME 多余字段,将删除 是否启用截止时间
            "break_on_enable" : fields.boolean("break_on_active"),
            #买断时长,以小时为单位
            "buyout_time" : fields.integer('buyout_time'),
            'active' : fields.boolean('active'),
            'test_time' : fields.time('test_time'),
            'test_datetime' : fields.datetime('test_datetime'),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({ field_name : True for field_name in _buyout_enable_fields})

    _defaults.update({
        "is_member" : False,
        "active" : True,
        })

    def get_active_configs(self,cr,uid,room_type_id):
        '''
        获取当前有效的买断设置信息
        :params integer room_type_id 包厢类型id
        :params integer buyout_config_id 买断设置id
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
        s_day_ids = self.pool.get('ktv.buyout_config_special_day').search(cr,uid,[("room_type_id",'=',room_type_id)])
        s_days = self.pool.get('ktv.buyout_config_special_day').read(cr,uid,s_day_ids,['room_type_id','special_day'])
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
                if in_sp_day:
                    buyout_fee = getattr(c,"special_day_buyout_fee")
                ret.append({
                    "id" : c.id,
                    "room_type_id" : c.room_type_id.id,
                    "name" : getattr(c,"name"),
                    #起始时间是当前时间
                    "time_from" : time_from.strftime('%Y-%m-%d %H:%M:%S'),
                    "time_to" : time_to.strftime('%Y-%m-%d %H:%M:%S'),
                    "is_member" : getattr(c,'is_member'),
                    "buyout_fee" : buyout_fee,
                    #计算实际买断分钟数量
                    "buyout_time" : (time_to.hour - time_from.hour)*60 + (time_to.minute - time_from.minute)
                    })
        return ret

    def get_active_buyout_fee(self,cr,uid,buyout_config_id,context = None):
        '''
        获取当前有效的买断费用信息,需要判断如下情况
        1、当前日期是否在买断设置日期范围内
        2、当前时间是否在买断规定时间段内
        3、另:还需判断特殊日设置
        4、另:还需判断是否会员设置
        '''
        config = self.browse(cr,uid,buyout_config_id)
        active_buyout_configs = self.get_active_configs(cr,uid,config.room_type_id.id)

        _logger.debug(buyout_config_id)
        _logger.debug(active_buyout_configs)
        ret = [c for c in active_buyout_configs if c['id'] == buyout_config_id]
        if not active_buyout_configs or not ret:
            raise osv.except_osv(_("错误"), _('当前选择的买断设置信息无效.'))
        return ret[0]
