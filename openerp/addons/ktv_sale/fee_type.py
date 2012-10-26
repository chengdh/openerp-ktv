# -*- coding: utf-8 -*-
from osv import fields, osv

class fee_type(osv.osv):
    #计费方式定义
    #只收包厢费
    FEE_TYPE_ONLY_ROOM_FEE = "only_room_fee"
    #只收钟点费
    FEE_TYPE_ONLY_HOURLY_FEE = "only_hourly_fee"
    #包厢费+钟点费
    FEE_TYPE_ROOM_FEE_PLUS_HOURLY_FEE = "room_fee_plus_hourly_fee"
    #最低消费:如酒水消费低于 “最低消费”则按“最低消费”收取,否则按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_TYPE_MINIMUM_FEE = "minimum_fee"
    #结账重开:只按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_TYPE_ONLY_CONSUME_FEE = "only_consume_fee"
    #包厢费+最低消费:包厢费必收,酒水费依据最低消费原则计算,除服务费外,免收其他费用
    FEE_TYPE_ROOM_FEE_PLUS_MINIMUM_FEE = "room_fee_plus_minimum_fee"
    #钟点费+最低消费:钟点费必收,酒水按照最低消费计算,除服务费外,免收其他费用
    FEE_TYPE_HOURLY_FEE_PLUS_MINIMUM_FEE = "hourly_fee_plus_minimum_fee"
    #包厢费+钟点费+最低消费
    FEE_TYPE_ROOM_FEE_PLUS_HOURLY_FEE_PLUS_MINIMUM_FEE = "room_fee_plus_hourly_fee_plus_minimum_fee"
    #买断
    FEE_TYPE_BUYOUT_FEE = "buyout_fee"
    #按位钟点费
    FEE_TYPE_HOURLY_FEE_P = "hourly_fee_p"
    #按位最低消费
    FEE_TYPE_MINIMUM_FEE_P = "minimum_fee_p"
    #自助餐?
    FEE_TYPE_BUFFET = "buffet"
    #酒水?
    FEE_TYPE_DRINKS = "drinks"


    _name = "ktv.fee_type"
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
