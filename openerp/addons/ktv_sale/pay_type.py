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
#
class ktv_pay_type(osv.osv):
    #系统预置支付方式
    #现金
    PAY_TYPE_CASH = "cash"
    #会员卡
    PAY_TYPE_MEMBER_CARD = "member_card"
    #信用卡
    PAY_TYPE_CREDIT_CARD = "credit_card"
    #抵用券
    PAY_TYPE_VOUCHER = "voucher"
    #免单
    PAY_TYPE_FEE = "free"
    #挂账
    PAY_TYPE_SUSPEND = "suspend"
    #支票
    PAY_TYPE_CHECK = "check"
    #储值卡
    PAY_TYPE_STORE_VALUE_CARD = "store_value_card"


    _name = "ktv.pay_type"
    _description = "付款方式定义,系统预置,不可删除"

    _columns = {
            'name' : fields.char("name",size = 64,required = True),
            #计费类型
            'pay_type_code' : fields.char("pay_type_code",size = 64,required = True,readonly = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'active' : True,
            }
