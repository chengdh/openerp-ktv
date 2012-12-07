# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

_logger = logging.getLogger(__name__)

class room_checkout_buyout(osv.osv):
    '''
    买断结账单,买断属于预售,应先付账,继承自ktv.room_checkout
    '''

    _name="ktv.room_checkout_buyout"

    _inherit = "ktv.room_checkout"

    _columns = {
            "buyout_config_id" : fields.many2one("ktv.buyout_config","buyout_config_id",required = True,select = True,help="买断名称"),
            "buyout_time_from" : fields.datetime("time_from",required = True,help="开房时间(此处指的是实际的开房时间)"),
            "buyout_time_to" : fields.datetime("time_to",required = True,help="关房时间"),
            "buyout_minutes" : fields.integer("buyout_minutes",help="买断时长"),
            "buyout_fee" : fields.float("buyout_fee",help="买断费用",digits_compute = dp.get_precision('Ktv Room Default Precision')),
            }
    #buyout_config_id member_id fee_typeid 发生变化时
    def onchange_buyout_config_id(self,cr,uid,buyout_config_id,context):
        '''
        buyout_config_id 重新结算费用
        '''
        the_buyout_config = self.pool.get('ktv.buyout_config').read(cr,uid,buyout_config_id,[])
        the_room = self.pool.get('ktv.room').browse(cr,uid,context["room_id"])
        the_fee_type = self.pool.get('ktv.fee_type').browse(cr,uid,context["fee_type_id"])
        if context["member_id"]:
            the_member = self.pool.get('ktv.member').browse(cr,uid,context['member_id'])




