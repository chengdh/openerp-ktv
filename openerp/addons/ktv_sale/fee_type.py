# -*- coding: utf-8 -*-
from osv import fields, osv
import ktv_helper
import decimal_precision as dp

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
            #服务费率,为0则按照包厢类别定义费费率收取
            'service_fee_rate' : fields.float('service_fee_rate',digits_compute = dp.get_precision('Ktv Fee')),
            #酒水价格类型
            'drinks_price_type' : fields.selection(ktv_helper.price_list_for_selection,string="drinks_price_type"),
            'member_class_discount_ids' : fields.one2many('ktv.fee_type_member_class_discount','fee_type_id','member_class_discount_ids'),
            'description' : fields.text('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            'service_fee_rate' : 0.0,
            }

    def get_fee_type_id(self,cr,uid,fee_type_code):
        '''
        根据fee_type_code获取fee_type_id
        :params string fee_type_code 计费方式编码
        :return integer fee_type_id
        '''
        ids = self.search(cr,uid,[['fee_type_code','=',fee_type_code]])
        if not ids:
            return None
        return ids[0]
