# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper
import fee_type

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

        ret ={
                'buyout_config_id' : context['buyout_config_id'],
                'open_time': active_buyout_config['time_from'].strftime("%Y-%m-%d %H:%M"),
                'close_time': active_buyout_config['time_to'].strftime("%Y-%m-%d %H:%M"),
                'consume_minutes' : active_buyout_config['buyout_time'],
                #买断时,不收取其他费用,仅仅收取钟点费
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
        if 'member_id' in context and context['member_id']:
            the_member = self.pool.get('ktv.member').browse(cr,uid,context['member_id'])
            member_room_fee_discount_rate = the_member.member_class_id.room_fee_discount
            member_room_fee_discount_fee = hourly_fee*member_room_fee_discount_rate/100
            ret['discount_rate'] = member_room_fee_discount_rate
            ret['discount_fee'] = member_room_fee_discount_fee


        #打折卡打折
        if 'discount_card_id' in context and context['discount_card_id']:
            discount_card = self.pool.get('ktv.discount_card').browse(cr,uid,context['discount_card_id'])
            discount_card_room_fee_discount_rate = discount_card.room_fee_discount
            discount_card_room_fee_discount_fee = hourly_fee*discount_card_room_fee_discount_rate/100
            ret['discount_rate'] = discount_card_room_fee_discount_rate
            ret['discount_fee'] = discount_card_room_fee_discount_fee

        #员工打折
        #TODO
        #if 'discounter_id' in context and context['discounter_id']:

        ret['after_discount_fee'] = hourly_fee - ret['discount_fee']
        ret['cash_fee'] = ret['after_discount_fee']
        return ret
