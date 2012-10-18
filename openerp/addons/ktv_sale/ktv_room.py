# -*- coding: utf-8 -*-
#ktv 相关对象定义

from datetime import datetime
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
import logging
from PIL import Image

import netsvc
from osv import fields, osv
from tools.translate import _
from decimal import Decimal
import decimal_precision as dp

_logger = logging.getLogger(__name__)


class ktv_room(osv.osv):
    """包厢定义"""
    _name = "ktv.ktv_room"
    _description = "包厢信息定义"

    _columns = {
            #名称
            'name' : fields.char('name',size = 64,required = True),
            #所属区域
            'ktv_room_area_id' : fields.many2one('ktv.ktv_room_area',"ktv_room_area_id"),
            #所属类别
            'ktv_room_type_id' : fields.many2one('ktv.ktv_room_type',"ktv_room_type_id",required = True),
            #机顶盒IP
            'ktv_box_ip' : fields.char('ktv_box_ip',size = 64),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #买断金额
            'buyout_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #拼音
            'py_code' : fields.char('room_fee',size = 64),
            #计费方式
            'fee_type_id' : fields.many2one('ktv.ktv_fee_type',"ktv_fee_type_id"),
            'state' : fields.selection([
            ('in_free','空闲'),
            ('in_use', '使用中'),
            ('in_debug', '调试中'),
            ('in_clean', '清洁中')
            ], 'state',readonly = True),
            #赠送套餐
            #包厢效果图
            'img_1' : fields.binary('pic_1',filters = "*.png,*.jpg,*.bmp"),
            'img_2' : fields.binary('pic_2',filters = "*.png,*.jpg,*.bmp"),
            'img_3' : fields.binary('pic_3',filters = "*.png,*.jpg,*.bmp"),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            'state' : 'in_free',
            }

    def onchange_ktv_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.ktv_room_type').browse(cr, uid, room_type_id)

        val ={
                "fee_type_id" : room_type.fee_type_id and room_type.fee_type_id.id or False,
                "room_fee" : room_type.room_fee,
                "hourly_fee" : room_type.hourly_fee,
                "buyout_fee" : room_type.buyout_fee,
                "minimum_fee" : room_type.minimum_fee,
                }

        return {"value" : val}

ktv_room()

class ktv_room_type(osv.osv):
    _name = "ktv.ktv_room_type"
    _description = "包厢类别定义"

    _columns = {
            #类别名称
            'name' : fields.char('ktv_room_type_name',size = 64,required = True ),
            'description' : fields.char('description',size = 255),
            #赠送套餐
            #TODO
            #酒水价格
            #TODO
            #计费方式
            'fee_type_id' : fields.many2one('ktv.ktv_fee_type',"fee_type_id"),
            #容纳人数
            'serve_persons' : fields.integer('serve_persons'),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #买断金额
            'buyout_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'buyout_fee' : 0,
            'minimum_fee' : 0,
            'active' : True,
            }
ktv_room_type()

class ktv_room_area(osv.osv):
    _name = "ktv.ktv_room_area"
    _description = "包厢所属区域定义"

    _columns = {
            'name' : fields.char('ktv_room_area_name',size = 64,required = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }

ktv_room_area()

class ktv_fee_type(osv.osv):
    _name = "ktv.ktv_fee_type"
    _description = "计费方式,系统预置,不可修改"

    _columns = {
            'name' : fields.char("ktv_fee_type",size = 64,required = True),
            #计费类型
            'fee_type_code' : fields.char("ktv_fee_type_code",size = 64,required = True,readonly = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }
    #计费方式定义
    #只收包厢费
    FEE_TYPE_ONLY_ROOM_FEE = "only_room_fee"
    #只收钟点费
    FEE_TYPE_ONLY_HOURLY_FEE = "only_hourly_fee"
    #包厢费+钟点费
    FEE_TYPE_ROOM_FEE_PLUS_HOURLY_FEE = "room_fee_plus_hourly_fee"
    #最低消费:如酒水消费低于 “最低消费”则按“最低消费”收取,否则按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_TYPE_MINIMUM_FEE = "minimum_fee"
    #固定时长买断
    FEE_TYPE_BUYOUT_FEE = "buyout_fee"
    #结账重开:只按酒水实际消费收取,其他一切费用(除服务费)均免收
    FEE_ONLY_CONSUM_FEE = "only_consum_fee"

ktv_fee_type()

class ktv_pay_type(osv.osv):
    _name = "ktv.ktv_pay_type"
    _description = "付款方式定义,系统预置,不可删除"

    _columns = {
            'name' : fields.char("ktv_pay_type",size = 64,required = True),
            #计费类型
            'pay_type_code' : fields.char("ktv_pay_type_code",size = 64,required = True),
            'description' : fields.char('description',size = 255),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'active' : True,
            }

ktv_pay_type()

class room_discount(osv.osv):
    """包厢打折设置,设置包厢每周各天的钟点费打折情况"""
    _name = "ktv.room_discount"
    _discription = "包厢打折设置,设置包厢每周各天的钟点费打折情况"
    #费用字段定义
    #其中discount字段存储的是百分比
    _fee_fields = [
            "mon_hourly_fee",
            "mon_hourly_discount",
            "mon_continue_hourly_fee",
            #周二
            "tue_hourly_fee",
            "tue_hourly_discount",
            "tue_continue_hourly_fee",
            #周三
            "wed_hourly_fee",
            "wed_hourly_discount",
            "wed_continue_hourly_fee",
            #周四
            "thurs_hourly_fee",
            "thurs_hourly_discount",
            "thurs_continue_hourly_fee",
            #周五
            "fri_hourly_fee",
            "fri_hourly_discount",
            "fri_continue_hourly_fee",
            #周六
            "sat_hourly_fee",
            "sat_hourly_discount",
            "sat_continue_hourly_fee",
            #周日
            "sun_hourly_fee",
            "sun_hourly_discount",
            "sun_continue_hourly_fee",
            #特殊日
            "special_day_hourly_fee",
            "special_day_hourly_discount",
            "special_day_continue_hourly_fee",
            ]

    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({
            #包厢类别
            "room_type_id" : fields.many2one("ktv.ktv_room_type","room_type_id",required = True),

            #打折时间限制
            "discount_time_from": fields.char("discount_time_from",required = True,size = 8 ),
            #打折消费时间结束值
            "discount_time_to": fields.char("discount_time_to",required = True,size = 8),
            #打折参考的基准价格,默认等于该包厢类别room_type的钟点费,用户可以修改
            "base_hourly_fee" : fields.float("base_hourly_fee", digits_compute= dp.get_precision('Ktv Room Default Precision')),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({
        "discount_time_from" : '8:30',
        "discount_time_to" : '12:30',
        #打折参考的基准价格,默认等于该包厢类别room_type的钟点费,用户可以修改
        "base_hourly_fee" : 0,
        })

    #包厢类别发生变化,基准价格同样改变
    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.ktv_room_type').browse(cr, uid, room_type_id)
        vals = self._reset_discount_info(room_type.hourly_fee)
        vals.update({"base_hourly_fee" : room_type.hourly_fee})
        return {"value" : vals}

    #重新设置各天费用为100%
    def _reset_discount_info(self,base_hourly_fee = 0):
        vals = {field_name : base_hourly_fee for field_name in self._fee_fields if field_name.find("fee") != -1}
        vals.update({field_name : 100.0 for field_name in self._fee_fields if field_name.find("discount") != -1})
        return vals

    #基准钟点费发生变换时,充值所有打折数据
    def onchange_base_hourly_fee(self,cr,uid,ids,base_hourly_fee):
        if base_hourly_fee and base_hourly_fee == 0 :
            return {}
        vals = self._reset_discount_info(base_hourly_fee)
        return {"value" : vals}

    #钟点费或钟点费折扣互为变化
    #context中传递了变化的字段
    def onchange_hourly_fee(self,cr,uid,ids,field_name = False,hourly_fee_or_discount_rate = False ,base_hourly_fee = False,context = None):
        val ={}
        if not base_hourly_fee or not field_name :
            return {}
        #如果是修改钟点费,则自动计算折扣百分比
        precision_discount = self.pool.get('decimal.precision').precision_get(cr, uid, 'Ktv Fee Discount Rate')
        precision_fee = self.pool.get('decimal.precision').precision_get(cr, uid, 'Ktv Fee')
        if field_name.find("hourly_fee") != -1 :
            to_change_fieldname = field_name.replace('fee','discount')
            val[to_change_fieldname] = round(Decimal(hourly_fee_or_discount_rate) / Decimal(base_hourly_fee) * 100,precision_discount)

        #如果是修改钟点费折扣,则自动计算折扣后的钟点费
        if field_name.find("hourly_discount") != -1 :
            to_change_fieldname = field_name.replace('discount','fee')
            val[to_change_fieldname] = round(Decimal(base_hourly_fee) * Decimal(hourly_fee_or_discount_rate) / 100,precision_fee)
        return {"value" : val}

room_discount()

class special_day(osv.osv):
    '''特殊日期定义,在包厢打折信息、买断设置、固定时长买断设置、会员时段打折信息中都会使用到'''
    _name="ktv.special_day"
    _columns ={'special_day' : fields.date('special_day')}

special_day()

class room_discount_special_day(osv.osv):
    '''包厢打折特殊日设置'''
    _inherit = "ktv.special_day"
    _name='ktv.room_discount_special_day'
    _columns = {
            "room_type_id" : fields.many2one("ktv.ktv_room_type","room_type_id"),
            }
room_discount_special_day()

class buyout_config(osv.osv):
    """买断信息设置"""
    _name = "ktv.buyout_config"
    _discription = "包厢买断信息设置"
    _fee_fields = [
            "mon_buyout_fee",
            #周二
            "tue_buyout_fee",
            #周三
            "wed_buyout_fee",
            #周四
            "thurs_buyout_fee",
            #周五
            "fri_buyout_fee",
            #周六
            "sat_buyout_fee",
            #周日
            "sun_buyout_fee",
            #特殊日
            "special_day_buyout_fee",
            ]

    _columns = { field_name : fields.float(field_name, digits_compute= dp.get_precision('Ktv Room Default Precision'),required = True) for field_name in _fee_fields}
    _columns.update({
            "name" : fields.char("name",size = 64,required = True),
            #包厢类别
            "room_type_id" : fields.many2one("ktv.ktv_room_type","room_type_id",required = True,help="请选择包厢类别"),
            #买断时间限制
            "time_from": fields.char("time_from",required = True,size = 8,help="买断起始时间" ),
            #打折消费时间结束值
            "time_to": fields.char("time_to",required = True,size = 8,help="买断结束时间"),
            "is_member" : fields.boolean("is_member",help="是否是会员专用买断"),
            })

    _defaults = { field_name : 0 for field_name in _fee_fields}

    _defaults.update({
        "time_from" : '8:30',
        "time_to" : '12:30',
        "is_member" : False,
        })

    #包厢类别发生变化,基准价格同样改变
    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.ktv_room_type').browse(cr, uid, room_type_id)
        vals = self._reset_discount_info(room_type.hourly_fee)
        return {"value" : vals}

    #重新设置各天费用为100%
    def _reset_buyout_fee(self,base_hourly_fee = 0):
        vals = {field_name : buyout_fee for field_name in self._fee_fields }
        return vals

buyout_config()

class buyout_config_special_day(osv.osv):
    '''包厢买断特殊日设置'''
    _inherit = "ktv.special_day"
    _name='ktv.buyout_config_special_day'
    _columns = {
            "room_type_id" : fields.many2one("ktv.ktv_room_type","room_type_id"),
            }
room_discount_special_day()


# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:


