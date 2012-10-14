# -*- coding: utf-8 -*-
#ktv 相关对象定义

from datetime import datetime
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

_logger = logging.getLogger(__name__)


class ktv_room(osv.osv):
    """包厢定义"""
    _name = "ktv.ktv_room"
    _description = "包厢信息定义"

    _columns = {
            #名称
            'name' : fields.char('name',size = 64,required = True),
            #所属区域
            'ktv_room_area_id' : fields.many2one('ktv.ktv_room_area',"ktv_room_area"),
            #所属类别
            'ktv_room_type_id' : fields.many2one('ktv.ktv_room_type',"ktv_room_type",required = True),
            #机顶盒IP
            'ktv_box_ip' : fields.char('ktv_box_ip',size = 64),
            #包厢费
            'room_fee' : fields.float('room_fee',digits = (15,2)),
            #钟点费
            'hourly_fee' : fields.float('room_fee',digits = (15,2)),
            #买断金额
            'buyout_fee' : fields.float('room_fee',digits = (15,2)),
            #最低消费
            'minimum_fee' : fields.float('room_fee',digits = (15,2)),
            #拼音
            'py_code' : fields.char('room_fee',size = 64),
            #计费方式
            'pay_type_id' : fields.many2one('ktv.ktv_pay_type',"ktv_pay_type"),
            #赠送套餐
            #包厢效果图
            'img_1' : fields.binary('pic_1',filters = "*.png,*.jpg,*.bmp"),
            'img_2' : fields.binary('pic_2',filters = "*.png,*.jpg,*.bmp"),
            'img_3' : fields.binary('pic_3',filters = "*.png,*.jpg,*.bmp"),
            }

    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            }

ktv_room()

class ktv_room_type(osv.osv):
    _name = "ktv.ktv_room_type"
    _description = "包厢类别定义"

    _columns = {
            #类别名称
            'name' : fields.char('ktv_room_type_name',size = 64,required = True ),
            #赠送套餐
            #TODO
            #酒水价格
            #TODO
            #计费方式
            'pay_type_id' : fields.many2one('ktv.ktv_pay_type',"ktv_pay_type"),
            #容纳人数
            'serve_persons' : fields.integer('serve_persons'),
            #包厢费
            'room_fee' : fields.float('room_fee',digits = (15,2)),
            #钟点费
            'hourly_fee' : fields.float('room_fee',digits = (15,2)),
            #买断金额
            'buyout_fee' : fields.float('room_fee',digits = (15,2)),
            #最低消费
            'minimum_fee' : fields.float('room_fee',digits = (15,2)),
            }
    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            }
ktv_room_type()

class ktv_room_area(osv.osv):
    _name = "ktv.ktv_room_area"
    _description = "包厢所属区域定义"

    _columns = {
            'name' : fields.char('ktv_room_area_name',size = 64,required = True),
            'description' : fields.char('description',size = 255),
            }

ktv_room_area()

class ktv_pay_type(osv.osv):
    _name = "ktv.ktv_pay_type"
    _description = "计费方式定义,系统预置,不可删除"

    _columns = {
            'name' : fields.char("ktv_pay_type",size = 64,required = True),
            #计费类型
            'pay_type_code' : fields.char("ktv_pay_type_code",size = 64,required = True),
            }

ktv_pay_type()
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
