# -*- coding: utf-8 -*-
import logging
from room import room
from osv import fields, osv
from datetime import date,datetime
import decimal_precision as dp
import ktv_helper
from fee_type import fee_type

_logger = logging.getLogger(__name__)

class room_checkout_buytime(osv.osv):
    """
    预售-买钟,继承自 ktv.room_checkout
    1、可按照优惠金额购买消费时间
    2、如果有设置买钟优惠信息,还可享受优惠
    3、如果是会员,可可享受会员特殊折扣
    """

    _name = "ktv.room_checkout_buytime"

    _inherit = "ktv.room_checkout"

    _columns = {
            "buytime_minutes" : fields.integer("buytime_minutes",help = "买钟时间,以分钟计算"),
            }

    _defaults = {
            "buytime_minutes" : 60,
            }

    def process_operate(self,cr,uid,buytime_vals):
        """
        处理买钟结账事件
        :params dict buytime_vals 买钟信息相关字段
        :return  tuple  room_buytime 处理过后的买钟信息对象
                        room_state  当前操作包厢所在状态
                        cron dict 定时操作对象
        """
        room_id = buytime_vals.pop("room_id")
        cur_rp_id = self.pool.get('ktv.room').find_or_create_room_operate(cr,uid,room_id)
        buytime_vals.update({"room_operate_id" : cur_rp_id})
        room_buytime_id = self.create(cr,uid,buytime_vals)
        fields = self.fields_get(cr,uid).keys()
        room_buytime = self.read(cr,uid,room_buytime_id,fields)
        return (room_buytime,room.STATE_BUYTIME,self._build_cron(room_id,room_buytime))

    def _build_cron(self,room_id,buytime_vals):
        """
        生成买钟对象的cron信息,由于买钟要到点自动关闭包厢
        :params integer room_id 包厢id
        :params dict buytime_vals 当前买钟对象数据
        :return dict 构造出的ir.cron对象的属性dict
        """
        cron_vals = {
                "name" : buytime_vals["room_operate_id"][1],
                "nextcall" : datetime.strptime(buytime_vals['close_time'],"%Y-%m-%d %H:%M:%S"),
                "model" : "ktv.room",
                "function" : "write",
                #需要定时修改包厢状态,并清空包厢当前operate_id
                "args" : "(%s,{'state' : '%s','current_room_operate_id' : None})" % (room_id ,room.STATE_FREE)
                }
        return cron_vals
