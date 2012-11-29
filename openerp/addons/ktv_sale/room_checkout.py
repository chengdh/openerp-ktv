# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

_logger = logging.getLogger(__name__)

#包厢结账对象
class room_checkout(osv.osv):
    _name="ktv.room_checkout"

    _columns = {
            "room_operate_id" : fields.may2one("room_operate","room_operate_id",required = True,help="结账单所对应的room_operate对象")
            "bill_datetime" : fields.datetime("bill_datetime",required = True,readonly = True,help="结账时间"),
            "open_time" : fields.datetime("open_time",required = True,help="开房时间"),
            "close_time" : fields.datetime("close_time",required = True,help="关房时间"),
            "guest_name" : fields.char("guest_name",size = 20,help="客人姓名"),
            "persons_count" : fields.integer("persons_count",help="客人人数"),
            "consume_minutes" : fields.integer("consume_minutes",required = True,help="消费时长"),
            "presenter_id" : fields.many2one("res.user","presenter_id",help ="赠送人"),
            "saler_id" : fields.many2one("res.user","saler_id",help ="销售经理"),
            "present_minutes" : fields.integer("present_minutes",help="赠送时长"),
            "fee_type_id" : fields.many2one("ktv.fee_type","fee_type_id",required = True,help="计费方式"),
            "room_fee" : fields.float("room_fee", digits_compute= dp.get_precision('Ktv Room Default Precision'),help="包厢费"),
            "service_fee_rate" : fields.float("service_fee_rate",digits = (15,4),help="服务费费率"),
            "service_fee" : fields.float("service_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="服务费"),
            "hourly_fee" : fields.float("hourly_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="钟点费"),
            "sum_hourly_fee_p" : fields.float("sum_hourly_fee_p",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="茶位费合计-按位钟点费"),
            "sum_buffet_fee" : fields.float("sum_buffet_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="自助餐费用合计"),
            "changed_room_hourly_fee" : fields.float("changed_room_hourly_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="换房费用"),
            "changed_room_minutes" : fields.integer("changed_room_minutes",help="换房消费时长度"),
            "merged_room_hourly_fee" : fields.float("merged_room_hourly_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="并房费用"),
            "minimum_fee" : fields.float("minimum_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="低消费用"),
            "minimum_fee_diff" : fields.float("minimum_fee_diff",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="低消差额"),
            "prepay_fee" : fields.float("prepay_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="预付金额"),
            "drinks_fee" : fields.float("drinks_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="酒水费"),
            "uncheckout_drinks_fee" : fields.float("uncheckout_drinks_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="未结酒水费"),
            "minimum_drinks_fee" : fields.float("minimum_drinks_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="计入低消酒水费"),
            "guest_damage_fee" : fields.float("guest_damage_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="客损费用"),



            #会员卡折扣
            "member_id" : fields.many2one("ktv.member","member_id",help="会员信息"),
            "member_room_fee_discount_rate" : fields.float("minimum_room_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="会员-房费折扣"),
            "member_room_fee_discount_fee" : fields.float("minimum_room_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="会员-房费折扣"),
            "member_drinks_fee_discount_rate" : fields.float("minimum_drinks_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="会员-酒水费折扣"),
            "member_drinks_fee_discount_fee" : fields.float("minimum_drinks_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="会员-酒水费折扣"),

            #打折卡打折
            "discount_card_id" : fields.many2one("ktv.discount_card","discount_card_id",help="打折卡id"),
            "discount_card_room_fee_discount_rate" : fields.float("discount_card_room_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="打折卡-房费折扣"),
            "discount_card_room_fee_discount_fee" : fields.float("discount_card_room_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="打折卡-房费折扣"),
            "discount_card_drinks_fee_discount_rate" : fields.float("discount_card_drinks_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="打折卡-酒水费折扣"),
            "discount_card_drinks_fee_discount_fee" : fields.float("discount_card_drinks_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="打折卡-酒水费折扣"),

            #员工打折字段
            "discounter_id" : fields.many2one("res.user","discounter_id",help="打折人id")
            "discounter_room_fee_discount_rate" : fields.float("discounter_room_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="操作员-房费折扣"),
            "discounter_room_fee_discount_fee" : fields.float("discounter_room_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="操作员-房费折扣"),
            "discounter_drinks_fee_discount_rate" : fields.float("discounter_drinks_fee_discount_rate",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="操作员-酒水费折扣"),
            "discounter_drinks_fee_discount_fee" : fields.float("discounter_drinks_fee_discount_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="-酒水费折扣"),

            #各种付款方式
            #现金
            "cash_fee" : fields.float("cash_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="现金支付金额"),
            #会员卡
            "member_card_fee" : fields.float("member_card_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="会员卡支付金额"),
            #信用卡&储蓄卡
            "credit_card_fee" : fields.float("credit_card_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="信用卡支付金额"),
            #储值卡
            #FIXME 此处和会员卡有重复,但是储值卡可不记名
            "store_value_card_fee" : fields.float("store_value_card_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="储值卡支付金额"),
            #抵用券
            "sales_voucher_fee" : fields.float("sales_voucher_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="抵用券支付金额"),
            #免单
            "freer_id" : fields.many2one("res.user","freer_id",help="免单人"),
            "free_fee" : fields.float("free_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="免单费用"),
            #按位消费免单
            "freer_persons_id"  : fields.many2one("res.user","freer_persons_id",help="免单人"),
            "free_persons_count" : fields.integer("free_persons_count",help="按位消费免单人数"),
            #挂账
            "on_crediter_id" : fields.many2one("res.user","on_crediter_id",help="挂账人"),
            "on_credit_fee" : fields.float("on_credit_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="免单费用"),
            #欢唱券
            "song_ticket_fee" : fields.float("song_ticket_fee",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="欢唱券抵扣费用"),
            "song_ticket_fee_diff" : fields.float("song_ticket_fee_diff",digits_compute = dp.get_precision('Ktv Room Default Precision'),help="欢唱券抵扣费用差额"),

            _defaults = {
                    #正常开房时,关房时间是当前时间
                    "close_time" : fields.datetime.now,
                    "consume_minutes" : 0,
                    "present_minutes" : 0,
                    "room_fee" : 0,
                    "service_fee_rate" : 0,
                    "service_fee" : 0,
                    "houly_fee" : 0,
                    "sum_hourly_fee_p" : 0,
                    "sum_buffet_fee" : 0,
                    "changed_hourly_fee" : 0,
                    "changed_room_minutes" : 0,
                    "merged_room_hourly_fee" : 0,
                    "minimum_fee" : 0,
                    "minimum_fee_diff" : 0,
                    "prepay_fee" : 0,
                    "drinks_fee" : 0,
                    "uncheckout_drinks_fee" : 0,
                    "minimum_drinks_fee" : 0,
                    "guest_damage_fee" : 0,
                    }









