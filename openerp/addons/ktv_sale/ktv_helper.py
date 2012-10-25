# -*- coding: utf-8 -*-
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
    ret =[("free","空闲"),("in_use","使用"),("preorder","预定"),("locked","锁定"),("checkout","已结账"),("buyout","买断"),("malfunction","故障"),("clean","清洁"),("debug","调试"),("visit","带客")]
    return ret

