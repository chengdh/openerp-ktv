# -*- coding: utf-8 -*-
from osv import fields
from datetime import date,datetime
import logging
_logger = logging.getLogger(__name__)
#时间段选择
def time_for_selection(self,cr,uid,context = None):
     ret = [("%02i:00" % i,"%02i时30分" % i) for i in range(24)] + [("%02i:30" % i,"%02i时00分" % (i+1)) for i in range(24)]
     ret.sort()
     return ret

#价格列表
def price_list_for_selection(self,cr,uid,context = None):
    ret =[("ting_price","大厅价"),("room_price","包厢价"),("member_price","会员价"),("vip_price","贵宾价"),("a_price","A类价"),("b_price","B类价")]
    return ret

#房态定义
def room_states_for_selection(self,cr,uid,context = None):
    ret =[("free","空闲"),("in_use","使用"),("scheduled","预定"),("locked","锁定"),("checkout","已结账"),("buyout","买断"),("malfunction","故障"),("clean","清洁"),("debug","调试"),("visit","带客")]
    return ret
#男女
def sexes_for_select(self,cr,uid,context = None):
    ret=[("F","女"),("M","男")]
    return ret
#证件类型
def id_types_for_select(self,cr,uid,context = None):
    ret=[(1,"身份证"),(2,"驾驶证"),(3,"其他证件")]
    return ret

#根据0 1 2 3 4 5 6 分别返回星期缩写 min =0 ~ sun= 6
def weekday_str(weekday_int):
    weekday_dict = {
            0 : 'mon',
            1 : 'tue',
            2 : 'wed',
            3 : 'thu',
            4 : 'fri',
            5 : 'sat',
            6 : 'sun'
            }
    return weekday_dict[weekday_int]

def current_user_tz(obj,cr,uid,context = None):
    """
    获取当前登录用户的时区设置
    :param cursor cr 数据库游标
    :params integer uid 当前登录用户id
    """
    the_user = obj.pool.get('res.users').read(cr,uid,uid,['id','context_tz','name'])
    return the_user['context_tz']

def user_context_now(obj,cr,uid):
    """
    获取当前登录用户的本地日期时间
    :return 本地化的当前日期
    """
    tz = current_user_tz(obj,cr,uid)
    context_now = fields.datetime.context_timestamp(cr,uid,datetime.now(),{"tz" : tz})
    return context_now
