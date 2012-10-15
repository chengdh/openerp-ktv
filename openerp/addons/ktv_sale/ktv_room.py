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
            'ktv_room_area_id' : fields.many2one('ktv.ktv_room_area',"ktv_room_area_id"),
            #所属类别
            'ktv_room_type_id' : fields.many2one('ktv.ktv_room_type',"ktv_room_type_id",required = True),
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
            'fee_type_id' : fields.many2one('ktv.ktv_fee_type',"ktv_fee_type_id"),
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
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            }

ktv_room()

class ktv_room_type(osv.osv):
    _name = "ktv.ktv_room_type"
    _description = "包厢类别定义"

    _columns = {
            #类别名称
            'name' : fields.char('ktv_room_type_name',size = 64,required = True ),
            'description' : fields.char('description',size = 255),
            #赠送套餐
            #TODO
            #酒水价格
            #TODO
            #计费方式
            'fee_type_id' : fields.many2one('ktv.ktv_fee_type',"ktv_fee_type"),
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
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            }
ktv_room_type()

class ktv_room_area(osv.osv):
    _name = "ktv.ktv_room_area"
    _description = "包厢所属区域定义"

    _columns = {
            'name' : fields.char('ktv_room_area_name',size = 64,required = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }

ktv_room_area()

class ktv_fee_type(osv.osv):
    _name = "ktv.ktv_fee_type"
    _description = "计费方式,系统预置,不可修改"

    _columns = {
            'name' : fields.char("ktv_fee_type",size = 64,required = True),
            #计费类型
            'fee_type_code' : fields.char("ktv_fee_type_code",size = 64,required = True,readonly = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }
    #计费方式定义
    #只收包厢费
    FEE_TYPE_ONLY_ROOM_FEE = "only_room_fee"
    #只收钟点费
    FEE_TYPE_ONLY_HOURLY_FEE = "only_hourly_fee"
    #包厢费+钟点费
    FEE_TYPE_ROOM_FEE_PLUS_HOURLY_FEE = "room_fee_plus_hourly_fee"
    #最低消费:如酒水消费低于 “最低消费”则按“最低消费”收取,否则按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_TYPE_MINIMUM_FEE = "minimum_fee"
    #固定时长买断
    FEE_TYPE_BUYOUT_FEE = "buyout_fee"
    #结账重开:只按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_ONLY_CONSUM_FEE = "only_consum_fee"

ktv_fee_type()

class ktv_pay_type(osv.osv):
    _name = "ktv.ktv_pay_type"
    _description = "付款方式定义,系统预置,不可删除"

    _columns = {
            'name' : fields.char("ktv_pay_type",size = 64,required = True),
            #计费类型
            'pay_type_code' : fields.char("ktv_pay_type_code",size = 64,required = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'active' : True,
            }

ktv_pay_type()
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
