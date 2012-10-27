# -*- coding: utf-8 -*-
from osv import fields, osv
class pay_type(osv.osv):
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
            'is_store_point' : fields.boolean('is_store_point'),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'active' : True,
            'is_store_point' : True,
            }
