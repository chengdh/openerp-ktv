# -*- coding: utf-8 -*-
#抵用券类型
from osv import fields, osv
import decimal_precision as dp

class sales_voucher_type(osv.osv):
    _name = "ktv.sales_voucher_type"
    _description = "抵用券类型定义"

    _columns = {
            'name' : fields.char('name',size = 64,required = True,help = "抵用券类型名称"),
            'face_value' : fields.float("face_value",digits_compute = dp.get_precision("Ktv Fee")),
            'active' : fields.boolean("active"),
            }


