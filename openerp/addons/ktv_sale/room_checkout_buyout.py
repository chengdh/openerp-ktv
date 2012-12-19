# -*- coding: utf-8 -*-
import logging
from room import room
from osv import fields, osv
import decimal_precision as dp
import ktv_helper
from fee_type import fee_type

_logger = logging.getLogger(__name__)

class room_checkout_buyout(osv.osv):
    '''
    买断结账单,买断属于预售,应先付账,继承自ktv.room_checkout
    '''

    _name="ktv.room_checkout_buyout"

    _inherit = "ktv.room_checkout"

    _columns = {
            "buyout_config_id" : fields.many2one("ktv.buyout_config","buyout_config_id",required = True,select = True,help="买断名称"),
            "buyout_fee" : fields.float("buyout_fee",help="买断费用",digits_compute = dp.get_precision('Ktv Room Default Precision')),
            }
    _defaults = {
            #默认情况下,计费方式是买断
            "fee_type_id" : lambda obj,cr,uid,context: obj.pool.get('ktv.fee_type').get_fee_type_id(cr,uid,fee_type.FEE_TYPE_BUYOUT_FEE)
            }


    def re_calculate_fee(self,cr,uid,context):
        '''
        重新计算费用信息
        :param context['buyout_config_id'] 当前买断id,不可为空
        :param context['room_id'] 当前包厢id,不可为空
        :param context['member_id'] 会员id,可能为空
        :param context['discount_card_id'] 打折卡id,可能为空
        :param context['discounter_id'] 员工id,可能为空
        '''
        active_buyout_config = self.pool.get('ktv.buyout_config').get_active_buyout_fee(cr,uid,context['buyout_config_id'])
        the_room = self.pool.get('ktv.room').browse(cr,uid,context["room_id"])

        hourly_fee = active_buyout_config['buyout_fee']
        ret = {
                'room_id' : context['room_id'],
                'open_time': active_buyout_config['time_from'],
                'close_time': active_buyout_config['time_to'],
                'consume_minutes' : active_buyout_config['buyout_time'],
                #买断时,不收取其他费用,仅仅收取钟点费
                'buyout_config_id' : context['buyout_config_id'],
                'buyout_fee' : hourly_fee,
                'hourly_fee' : hourly_fee,
                'room_fee' : 0,
                'service_fee_rate' : 0,
                'service_fee' : 0,
                'minimum_fee' : 0,
                'minimum_fee_diff' : 0,
                'changed_room_hourly_fee' : 0,
                'changed_room_minutes' : 0,
                'merged_room_hourly_fee' : 0,
                'sum_should_fee' : hourly_fee,
                'discount_fee' : 0,
                'discount_rate' : 0,
                }
        #同时只能有一种打折方式可用
        #会员打折费用

        #打折卡打折
        if 'discount_card_id' in context and context['discount_card_id']:
            discount_card = self.pool.get('ktv.discount_card').browse(cr,uid,context['discount_card_id'])
            ret['discount_card_id'] = context['discount_card_id']
            ret['discount_card_room_fee_discount_rate'] = discount_card_room_fee_discount_rate = discount_card.discount_card_type_id.room_fee_discount
            ret['discount_card_room_fee_discount_fee'] = discount_card_room_fee_discount_fee = hourly_fee*(100 - discount_card_room_fee_discount_rate)/100
            ret['discount_rate'] = discount_card_room_fee_discount_rate
            ret['discount_fee'] = discount_card_room_fee_discount_fee

        if 'member_id' in context and context['member_id']:
            the_member = self.pool.get('ktv.member').browse(cr,uid,context['member_id'])
            ret['member_id'] = context['member_id']
            ret['member_room_fee_discount_rate'] = member_room_fee_discount_rate = the_member.member_class_id.room_fee_discount
            ret['member_room_fee_discount_fee'] = member_room_fee_discount_fee = hourly_fee*(100 - member_room_fee_discount_rate)/100
            ret['discount_rate'] = member_room_fee_discount_rate
            ret['discount_fee'] = member_room_fee_discount_fee


        #员工打折
        #TODO
        #if 'discounter_id' in context and context['discounter_id']:

        ret['after_discount_fee'] = hourly_fee - ret['discount_fee']
        ret['cash_fee'] = ret['after_discount_fee']
        ret['act_pay_fee'] = ret['cash_fee']
        ret['change_fee'] = 0.0
        ret.update({
            'member_card_fee' : 0.0,
            'credit_card_fee' : 0.0,
            'sales_voucher_fee' : 0.0,
            })
        return ret

    def process_operate(self,cr,uid,buyout_vals):
        """
        处理买断结账信息
        """
        room_id = buyout_vals.pop("room_id")
        cur_rp_id = self.pool.get('ktv.room').find_or_create_room_operate(cr,uid,room_id)
        buyout_vals.update({"room_operate_id" : cur_rp_id})
        room_buyout_id = self.create(cr,uid,buyout_vals)
        fields = self.fields_get(cr,uid).keys()
        room_buyout = self.read(cr,uid,room_buyout_id,fields)
        return (room_buyout,room.STATE_BUYOUT,None)
