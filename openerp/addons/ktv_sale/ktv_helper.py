# -*- coding: utf-8 -*-
from osv import fields
from datetime import date,datetime,time
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

def minutes_delta(time_from,time_to):
    '''
    计算给定两个时间的相差分钟数
    :param time_from string 形式是'09:30'的字符串,指的是起始时间
    :param time_to string 形式是'09:30'的字符串,指的是结束时间时间
    :return integer 两个时间的相差分钟数
    '''
    array_time_from = [int(a) for a in time_from.split(':')]
    array_time_to = [int(a) for a in time_to.split(':')]
    t1 = time(array_time_from[0],array_time_from[1])
    t2 = time(array_time_to[0],array_time_to[1])
    return (t2.hour - t1.hour)*60 + (t2.minute - t1.minute)

def context_now_minutes_delta(obj,cr,uid,time_to):
    '''
    计算当前时间到给定时间的相差分钟数,该计算是以当期登录用户所在市区进行计算的
    :param object obj osv对象
    :param cursot cr 数据库游标
    :param integer uid 当前登录用户
    :param string time_to 当前时间
    :return integer 两个时间的相差分钟数
    '''
    context_now = user_context_now(obj,cr,uid)
    return minutes_delta(context_now.strftime("%H:%M"),time_to)

def context_strptime(osv_obj,cr,uid,str_time):
    '''
    将给定的时间字符串转变为当日的时间，以当前登录用户的时区为标准
    :param osv_obj osv数据库对象
    :param cr db cursor
    :param int uid 当前登录用户
    :param str_time 形式为'09:30'的时间字符串
    :return datetime 计算过后的日期对象
    '''
    context_now = user_context_now(osv_obj,cr,uid)
    time_array = [int(a) for a in str_time.split(":")]
    context_now.replace(hour=time_array[0],minute=time_array[1])
    return context_now

