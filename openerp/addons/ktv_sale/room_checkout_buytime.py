# -*- coding: utf-8 -*-
import logging
from room import room
from osv import fields, osv
from datetime import date,datetime,timedelta
import decimal_precision as dp
import ktv_helper
from fee_type import fee_type

_logger = logging.getLogger(__name__)

class room_checkout_buytime(osv.osv):
    """
    预售-买钟,继承自 ktv.room_checkout
    1、可按照优惠金额购买消费时间
    2、如果有设置买钟优惠信息,还可享受优惠
    3、如果是会员,可可享受会员特殊折扣
    """

    _name = "ktv.room_checkout_buytime"

    _inherit = "ktv.room_checkout"

    _defaults = {
            #默认开房时间是当前时间
            "open_time" :  datetime.now(),
            #默认关房时间是None
            "close_time" : None,
            }

    def re_calculate_fee(self,cr,uid,context):
        """
        客户端的数据发生改变时,重新计算费用信息
        计算步骤:
        1、获取当前包厢低消信息
        2、获取当前包厢钟点费优惠信息(普通、会员、按位)
        3、获取买钟优惠信息(普通、会员)
        4、根据买钟时间计算赠送时间
        4、根据买钟时间和赠送时间计算到钟时间
        5、根据计费方式计算金额
        6、返回计算结果
        :params context 包含计算上下问信息,required
        :params context[room_id] integer 包厢id,required
        :params context[fee_type_id] integer 计费方式id required
        :params context[buytime_minutes] integer 买钟时间 required
        :params context[price_class_id] integer 价格类型 required
        :params context[persons_count] integer 客人人数
        :params context[member_id] integer 会员卡id
        :params context[discount_card_id] integer 打折卡id
        :params context[discounter_id] integer 员工id,用于记录打折员工信息
       """

        #获取当前包厢费用信息
        room_id = context.pop('room_id')
        buy_minutes = consume_minutes = context['buy_minutes']
        room = self.pool.get('ktv.room').browse(cr,uid,room_id)
        #买钟优惠信息
        hourly_fee_promotions = self.pool.get('ktv.hourly_fee_promotion').get_active_configs(cr,uid)

        #(包厢id,包厢费,钟点费#钟点费折扣(%),按位钟点费,按位钟点费折扣(%),最低消费,按位最低消费,最低计费人数)
        (r_id,room_fee,minimum_fee,minimum_fee_p,minimum_persons,is_member_hourly_fee,hourly_fee,hourly_discount,hourly_fee_p,hourly_p_discount) = self.pool.get('ktv.room').get_current_fee_tuple(cr,uid,room_id,context)

        #默认无折扣
        discount_rate = 0;discount_fee = 0
        #客人人数
        persons_count = ('persons_count' in context and context['persons_count']) or minimum_persons
        #买钟优惠
        (promotion_buy_minutes,promotion_present_minutes) = (0,0)
        if hourly_fee_promotions:
            (promotion_buy_minutes,promotion_present_minutes) = (hourly_fee_promotions[0]['buy_minutes'],hourly_fee_promotions[0]['present_minutes'])
        #原钟点费合计
        sum_origin_hourly_fee = room.hourly_fee * buy_minutes/60
        sum_hourly_fee = hourly_fee*buy_minutes
        #按人钟点费合计
        sum_origin_hourly_fee_p=room.hourly_fee_p*buy_minutes*persons_count/60
        sum_hourly_fee_p=hourly_fee_p*buy_minutes*persons_count

        #时长合计 = 买钟时间 + 赠送时间
        present_minutes = ktv_helper.calculate_present_minutes(buy_minutes,promotion_buy_minutes,promotion_present_minutes)
        sum_minutes = buy_minutes + present_minutes
        #计算包厢关闭时间
        open_time = datetime.now()
        close_time = open_time + timedelta(minutes = sum_minutes)

        #打折卡折扣
        discount_card = None
        if 'discount_card_id' in context and context['discount_card_id']:
            discount_card = self.pool.get('ktv.discount_card').browse(cr,uid,context['discount_card_id'])
            discount_card_id = context['discount_card_id']
            discount_card_room_fee_discount_rate = discount_card.discount_card_type_id.room_fee_discount
            discount_card_room_fee_discount_fee = sum_origin_hourly_fee*(100 - discount_card_room_fee_discount_rate)/100
            discount_rate = discount_card_room_fee_discount_rate
            discount_fee = discount_card_room_fee_discount_fee

        #计算会员折扣信息
        #FIXME 此处需要处理会员折扣的问题：
        #存在这样的情况：当前已存在会员钟点折扣设置,此时会员卡又有房费折扣设置,此时取哪一种折扣设置
        #逻辑判断:如果当前是会员时段,则总房费不再折扣,否则按照总房费对会员消费折扣

        member = None
        if "member_id" in context and context['member_id']:
            member = self.pool.get('ktv.member').browse(context['member_id'])
            member_room_fee_discount_rate = member.member_class_id.room_fee_discount
            member_room_fee_discount_fee = sum_origin_hourly_fee*(100 - member.member_class_id.room_fee_discount) /100
            #判断是否启用了会员时段钟点费
            if is_member_hourly_fee:
                member_room_fee_discount_rate = hourly_discount
                member_room_fee_discount_fee = sum_origin_hourly_fee*(100 - member_room_fee_discount_rate) /100

            discount_rate = member_room_fee_discount_rate
            discount_fee = member_room_fee_discount_fee


        ret = {
                "room_id" : room_id,
                "fee_type_id" : context['fee_type_id'],
                "price_class_id" : context['price_class_id'],
                "open_time" : open_time.strftime("%Y-%m-%d %H:%M:%S"),
                "close_time" : close_time.strftime("%Y-%m-%d %H:%M:%S"),
                "persons_count" : persons_count,
                "consume_minutes" : consume_minutes,
                "present_minutes" : present_minutes,
                "room_fee" : room_fee,
                "hourly_fee" : sum_origin_hourly_fee,
                "sum_hourly_fee_p" : sum_origin_hourly_fee_p,
                "changed_room_hourly_fee" : 0,
                "changed_room_minutes" : 0,
                "merged_room_hourly_fee" : 0,
                "minimum_fee" : minimum_fee,
                "minimum_fee_diff" : 0,
                "service_fee_rate" : room.service_fee_rate,
                "discount_rate" : discount_rate,
                "discount_fee" : discount_fee,
                }

        if discount_card:
            ret.update({
                "discount_card_id" : discount_card.id,
                "discount_card_room_fee_discount_rate" : discount_card_room_fee_discount_rate,
                "discount_card_room_fee_discount_fee" : discount_card_room_fee_discount_fee,
                })

        if member:
            ret.update({
                "member_card_id" : member.id,
                "member_room_fee_discount_rate" : member_room_fee_discount_rate,
                "member_room_fee_discount_fee" : member_room_fee_discount_fee,
                })

        #根据计费方式计算费用信息
        fee_type = self.pool.get('ktv.fee_type').browse(cr,uid,context['fee_type_id'])

        #只收包厢费
        if fee_type.fee_type_code == fee_type.FEE_TYPE_ONLY_ROOM_FEE:
            ret.update({
                "service_fee_rate" : 0,
                "service_fee" : 0,
                "hourly_fee" : 0,
                "sum_hourly_fee_p" : 0,
                })

        #只收钟点费
        elif fee_type.fee_type_code == fee_type.FEE_TYPE_ONLY_HOURLY_FEE:
            ret.update({
                "room_fee" : 0,
                "sum_hourly_fee_p" : 0,
                })
        #包厢费加钟点费
        elif fee_type.fee_type_code == fee_type.FEE_TYPE_ROOM_FEE_PLUS_HOURLY_FEE:
            ret.update({"sum_hourly_fee_p" : 0 })
       #按位钟点费
        elif fee_type.fee_type_code == fee_type.FEE_TYPE_HOURLY_FEE_P:
            ret.update({"room_fee" : 0,"hourly_fee" : 0})
        else:
            #NOTE 其他计费方式不适用
            pass
        #计算其他费用
        #服务费
        ret['service_fee'] = (ret['room_fee'] + ret['hourly_fee'] + ret['sum_hourly_fee_p'])*ret['service_fee_rate']
        ret['sum_should_fee'] = ret['room_fee'] + ret['hourly_fee'] + ret['sum_hourly_fee_p'] + ret['service_fee']
        ret['after_discount_fee'] = ret['sum_should_fee'] - ret['discount_fee']
        ret['cash_fee'] = ret['after_discount_fee']
        ret['act_pay_fee'] = ret['cash_fee']
        ret['change_fee'] = 0.0
        ret.update({
            'member_card_fee' : 0.0,
            'credit_card_fee' : 0.0,
            'sales_voucher_fee' : 0.0,
            })

        return ret

    def process_operate(self,cr,uid,buytime_vals):
        """
        处理买钟结账事件
        :params dict buytime_vals 买钟信息相关字段
        :return  tuple  room_buytime 处理过后的买钟信息对象
                        room_state  当前操作包厢所在状态
                        cron dict 定时操作对象
        """
        room_id = buytime_vals.pop("room_id")
        cur_rp_id = self.pool.get('ktv.room').find_or_create_room_operate(cr,uid,room_id)
        buytime_vals.update({"room_operate_id" : cur_rp_id})
        room_buytime_id = self.create(cr,uid,buytime_vals)
        fields = self.fields_get(cr,uid).keys()
        room_buytime = self.read(cr,uid,room_buytime_id,fields)
        return (room_buytime,room.STATE_BUYTIME,self._build_cron(room_id,room_buytime))

    def _build_cron(self,room_id,buytime_vals):
        """
        生成买钟对象的cron信息,由于买钟要到点自动关闭包厢
        :params integer room_id 包厢id
        :params dict buytime_vals 当前买钟对象数据
        :return dict 构造出的ir.cron对象的属性dict
        """
        cron_vals = {
                "name" : buytime_vals["room_operate_id"][1],
                "nextcall" : datetime.strptime(buytime_vals['close_time'],"%Y-%m-%d %H:%M:%S"),
                "model" : "ktv.room",
                "function" : "write",
                #需要定时修改包厢状态,并清空包厢当前operate_id
                "args" : "(%s,{'state' : '%s','current_room_operate_id' : None})" % (room_id ,room.STATE_FREE)
                }
        return cron_vals

