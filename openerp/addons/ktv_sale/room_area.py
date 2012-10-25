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

_logger = logging.getLogger(__name__)


class ktv_room_area(osv.osv):
    _name = "ktv.room_area"
    _description = "包厢所属区域定义"

    _columns = {
            'name' : fields.char('name',size = 64,required = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }

