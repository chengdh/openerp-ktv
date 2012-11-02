# -*- coding: utf-8 -*-
#抵用券信息登记
from osv import fields, osv
import decimal_precision as dp

class sales_voucher(osv.osv):
    _name = "ktv.sales_voucher"
    _description = "抵用券登记"

    #未使用/已使用/已作废
    STATE_DRAFT = "draft"
    STATE_USED = "used"
    STATE_CANCELED = "canceled"

    _columns = {
            'id_number' : fields.char('id_number',size = 24,required = True,help = "抵用券唯一编号"),
            'face_value' : fields.float("face_value",digits_compute = dp.get_precision("Ktv Fee"),required = True),
            'as_money' : fields.float("as_money",digits_compute = dp.get_precision("Ktv Fee"),requred = True),
            'datetime_from' : fields.datetime('datetime_from'), #有效期从
            'datetime_to' : fields.datetime('datetime_to'),   #有效期截止
            'description' : fields.text('description',size = 255),
            'state' : fields.selection([(STATE_DRAFT,"未使用"),(STATE_USED,"已使用"),(STATE_CANCELED,"已作废")],"state",requred = True),
            'active' : fields.boolean("active"),
            }
    _defaults = {
            "state" : STATE_DRAFT,
            'face_value' : 50.00,
            "as_money" : 50.00,
            "datetime_from" :  fields.datetime.now,
            }

