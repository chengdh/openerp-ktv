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


class ktv_room_type(osv.osv):
    _name = "ktv.room_type"
    _description = "包厢类别定义"

    _columns = {
            #类别名称
            'name' : fields.char('name',size = 64,required = True ),
            'description' : fields.char('description',size = 255),
            #赠送套餐
            #酒水价格
            'price_type' : fields.selection(ktv_helper.price_list_for_selection,string="price_type"),
            #计费方式
            'fee_type_id' : fields.many2one('ktv.fee_type',"fee_type_id"),
            #容纳人数
            'serve_persons' : fields.integer('serve_persons'),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('hourly_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('minimum_fee',digits_compute = dp.get_precision('Ktv Fee')),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            }
