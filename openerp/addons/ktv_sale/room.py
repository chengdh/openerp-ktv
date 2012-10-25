# -*- coding: utf-8 -*-
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging
from PIL import Image

import netsvc
from osv import fields, osv
from tools.translate import _
from decimal import Decimal
import decimal_precision as dp
import ktv_helper

_logger = logging.getLogger(__name__)

class room(osv.osv):
    """包厢定义"""

    #房态定义
    #空闲、使用、预订、锁定、已结帐、买断、故障、呼叫?、提醒?、带客、清洁、调试
    ROOM_STATE_FREE = "free"
    ROOM_STATE_IN_USE = "in_use"
    ROOM_STATE_PREORDER = "preorder"
    ROOM_STATE_LOCK = "locked"
    ROOM_STATE_CHECKOUT = "checkout"
    ROOM_STATE_BUYOUT = "buyout"
    ROOM_STATE_MALFUNCTION = "malfunction"
    ROOM_STATE_VISIT = "visit"
    ROOM_STATE_CLEAN = "clean"
    ROOM_STATE_DEBUG = "debug"

    _name = "ktv.room"
    _description = "包厢信息定义"

    _columns = {
            #名称
            'name' : fields.char('name',size = 64,required = True),
            #所属区域
            'room_area_id' : fields.many2one('ktv.room_area',"room_area_id"),
            #所属类别
            'room_type_id' : fields.many2one('ktv.room_type',"room_type_id",required = True),
            #机顶盒IP
            'ktv_box_ip' : fields.char('ktv_box_ip',size = 64),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('hourly_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('minimum_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #拼音
            'py_code' : fields.char('py_code',size = 64),
            #计费方式
            'fee_type_id' : fields.many2one('ktv.fee_type',"fee_type_id"),
            'state' : fields.selection(ktv_helper.room_states_for_selection, 'state',readonly = True),
            #赠送套餐
            #包厢效果图
            'img_1' : fields.binary('pic_1',filters = "*.png,*.jpg,*.bmp"),
            'img_2' : fields.binary('pic_2',filters = "*.png,*.jpg,*.bmp"),
            'img_3' : fields.binary('pic_3',filters = "*.png,*.jpg,*.bmp"),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            'state' : 'free',
            }

    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.room_type').browse(cr, uid, room_type_id)

        val ={
                "fee_type_id" : room_type.fee_type_id and room_type.fee_type_id.id or False,
                "room_fee" : room_type.room_fee,
                "hourly_fee" : room_type.hourly_fee,
                "minimum_fee" : room_type.minimum_fee,
                }

        return {"value" : val}
