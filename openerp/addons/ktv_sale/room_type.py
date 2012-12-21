# -*- coding: utf-8 -*-
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

class room_type(osv.osv):
    _name = "ktv.room_type"
    _description = "包厢类别定义"

    _columns = {
            #类别名称
            'name' : fields.char('name',size = 64,required = True ),
            'description' : fields.text('description',size = 255),
            #赠送套餐
            #酒水价格
            'drinks_price_type' : fields.selection(ktv_helper.price_list_for_selection,string="drinks_price_type"),
            #计费方式
            'fee_type_id' : fields.many2one('ktv.fee_type',"fee_type_id"),
            #容纳人数
            'serve_persons' : fields.integer('serve_persons'),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('hourly_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #按位钟点费
            'hourly_fee_p' : fields.float('hourly_fee_p',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('minimum_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #按位低消
            'minimum_fee_p' : fields.float('minimum_fee_p',digits_compute = dp.get_precision('Ktv Fee')),
            'service_fee_rate' : fields.float('service_fee_rate',digits_compute = dp.get_precision('Ktv Fee'),help="服务费费率%"),
            #赠送比例
            'present_rate' : fields.float('present_rate',digits_compute = dp.get_precision('Ktv Fee')),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'hourly_fee_p' : 0,
            'minimum_fee' : 0,
            'minimum_fee_p' : 0,
            'service_fee_rate' : 0,
            'present_rate' : 0,
            'active' : True,
            }
