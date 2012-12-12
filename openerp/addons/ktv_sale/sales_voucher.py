# -*- coding: utf-8 -*-
#抵用券信息登记
from osv import fields, osv
import decimal_precision as dp
from datetime import date,datetime

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
            'date_from' : fields.date('date_from',required = True), #有效期从
            'date_to' : fields.date('date_to',required = True),   #有效期截止
            'description' : fields.text('description',size = 255),
            'state' : fields.selection([(STATE_DRAFT,"未使用"),(STATE_USED,"已使用"),(STATE_CANCELED,"已作废")],"state",requred = True),
            'active' : fields.boolean("active"),
            }
    _defaults = {
            "state" : STATE_DRAFT,
            'face_value' : 50.00,
            "as_money" : 50.00,
            "date_from" :  fields.datetime.now,
            "active" : True
            }

    def get_active_sales_voucher(self,cr,uid,sales_voucher_id):
        '''
        根据抵用券编码获取有效的抵用券信息
        sales_voucher_id string 抵用券编号
        return dict 抵用券信息
        '''
        ret = []
        if sales_voucher_id:
            ids = self.search(cr,uid,[("id_number",'=',sales_voucher_id),("state",'=',sales_voucher.STATE_DRAFT),("date_from","<=",date.today()),("date_to",">=",date.today())])
            if ids:
                ret =  self.read(cr,uid,ids[0],['id','id_number','face_value','as_money','datetime_from','datetime_to'])
        return ret
