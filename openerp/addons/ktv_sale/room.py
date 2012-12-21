# -*- coding: utf-8 -*-
import logging
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

_logger = logging.getLogger(__name__)

class room(osv.osv):
    """包厢定义"""

    #房态定义
    #空闲、使用、预订、锁定、已结帐、买断、故障、呼叫?、提醒?、带客、清洁、调试
    STATE_FREE = "free"
    STATE_IN_USE = "in_use"
    STATE_SCHEDULED = "scheduled"
    STATE_LOCK = "locked"
    STATE_CHECKOUT = "checkout"
    STATE_BUYOUT = "buyout"
    STATE_BUYTIME = "buytime"
    STATE_MALFUNCTION = "malfunction"
    STATE_VISIT = "visit"
    STATE_CLEAN = "clean"
    STATE_DEBUG = "debug"

    _name = "ktv.room"
    _description = "包厢信息定义"

    _columns = {
            #名称
            'name' : fields.char('name',size = 64,required = True),
            #所属区域
            'room_area_id' : fields.many2one('ktv.room_area',"room_area_id"),
            #所属类别
            'room_type_id' : fields.many2one('ktv.room_type',"room_type_id",required = True),
            #计费方式
            'fee_type_id' : fields.many2one('ktv.fee_type',"fee_type_id"),
            #机顶盒IP
            'ktv_box_ip' : fields.char('ktv_box_ip',size = 64),
            #包厢费
            'room_fee' : fields.float('room_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #钟点费
            'hourly_fee' : fields.float('hourly_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee' : fields.float('minimum_fee',digits_compute = dp.get_precision('Ktv Fee')),
            #按位钟点费
            'hourly_fee_p' : fields.float('hourly_fee_p',digits_compute = dp.get_precision('Ktv Fee')),
            #最低消费
            'minimum_fee_p' : fields.float('minimum_fee_p',digits_compute = dp.get_precision('Ktv Fee')),
            #最低计费人数,按位计费时使用
            'minimum_persons' : fields.integer('minimum_persons'),
            'service_fee_rate' : fields.float('service_fee_rate',digits_compute = dp.get_precision('Ktv Fee'),help="服务费费率%"),
            #序号
            'sequence' : fields.integer('sequence'),
            #拼音
            'py_code' : fields.char('py_code',size = 64),
            'state' : fields.selection(ktv_helper.room_states_for_selection, 'state',readonly = True),
            #赠送套餐
            #包厢效果图
            'img_1' : fields.binary('room_pic_1',filters = "*.png,*.jpg,*.bmp"),
            'img_2' : fields.binary('room_pic_2',filters = "*.png,*.jpg,*.bmp"),
            'img_3' : fields.binary('room_pic_3',filters = "*.png,*.jpg,*.bmp"),
            'description' : fields.text('description',size = 255),
            'current_room_operate_id' : fields.many2one('ktv.room_operate','current_room_operate_id',readonly = True,help = "当前包厢操作对象"),
            'open_time' : fields.datetime('open_time',help = "开房时间",readonly = True),
            'presale_break_on_time' : fields.datetime('presale_break_on_time',help ="预售到钟时间(包括买钟和买断)",readonly = True),
            'member_id' : fields.many2one('ktv.member','member_id',help="会员编码"),
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'minimum_fee' : 0,
            'hourly_fee_p' : 0,
            'minimum_fee_p' : 0,
            'service_fee_rate' : 0,
            'minimum_persons' : 1,
            'sequence' : 0,
            'active' : True,
            'state' : STATE_FREE,
            }

    def onchange_room_type_id(self,cr,uid,ids,room_type_id):
        if not room_type_id:
            return {}
        room_type = self.pool.get('ktv.room_type').browse(cr, uid, room_type_id)

        val ={
                "fee_type_id" : room_type.fee_type_id and room_type.fee_type_id.id or False,
                "room_fee" : room_type.room_fee,
                "hourly_fee" : room_type.hourly_fee,
                "minimum_fee" : room_type.minimum_fee,
                "hourly_fee_p" : room_type.hourly_fee_p,
                "minimum_fee_p" : room_type.minimum_fee_p,
                }

        return {"value" : val}
    #获取或创建当前包厢的room_operate对象
    def find_or_create_room_operate(self,cr,uid,room_id):
        '''
        查找或创建当前包厢的room_operate
        返回room_operate_id
        '''
        room = self.browse(cr,uid,room_id)
        op_obj = room.current_room_operate_id
        if not op_obj:
            op_id = self.pool.get('ktv.room_operate').create(cr,uid,{"room_id" : room_id})
            #更新当前包厢的操作对象
            self.write(cr,uid,[room_id],{"current_room_operate_id" : op_id})
        else:
            op_id = op_obj.id
        return op_id

    def get_current_fee(self,cr,uid,room_id,context = None):
        """
        根据包厢低消费设置,获取包厢的费用信息,逻辑如下:
        room_fee 包厢费,如果没有对应低消设置,则取包厢本身设置信息
        hourly_fee 钟点费,如果没有对应的钟点优惠设置,则取包厢自身设置
        hourly_fee_p 同上
        minimum_fee 最低消费 如果没有对应的低消设置,则取包厢本身设置
        minimum_fee_p 同上
        :params integer room_id 包厢id
        :params context['member_class_id'] integer 会员等级id,查询时段钟点费时有用
        :params context['price_class_id'] integer 价格类型id,查询时段钟点费时有用
        :return dict 当前包厢费用信息
        """
        room = self.browse(cr,uid,room_id)
        ret = {"room_id" : room_id,
                "room_fee" : room.room_fee,
                "minimum_fee" : room.minimum_fee,
                "minimum_fee_p" : room.minimum_fee_p,
                "minimum_persons" : room.minimum_persons,
                #是否是会员折扣
                "is_member_hourly_fee" : False,
                "hourly_fee" : room.hourly_fee,
                "hourly_fee_p" : room.hourly_fee_p,
                "hourly_discount" : 100,
                "hourly_p_discount" : 100
                }
        #获取低消设置
        minimum_fee_config = self.pool.get('ktv.minimum_fee_config').get_active_configs(cr,uid,room.room_type_id.id)

        if minimum_fee_config:
            ret.update({
                "room_fee" : minimum_fee_config[0]['room_fee'],
                "minimum_fee" : minimum_fee_config[0]['minimum_fee'],
                "minimum_fee_p" : minimum_fee_config[0]['minimum_fee_p'],
                })

        #获取时段钟点费设置
        member_class_id = context and context.pop('member_class_id',None)
        hourly_fee_discount_configs =  self.pool.get('ktv.hourly_fee_discount').get_active_configs(cr,uid,room.room_type_id.id,context)
        if hourly_fee_discount_configs:
            ret.update({
                "hourly_fee" : hourly_fee_discount_configs[0]['hourly_fee'],
                "hourly_discount" : hourly_fee_discount_configs[0]['hourly_discount']
                })
        #按位钟点费设置
        hourly_fee_p_discount_configs =  self.pool.get('ktv.hourly_fee_p_discount').get_active_configs(cr,uid,room.room_type_id.id,context)
        if hourly_fee_p_discount_configs:
            ret.update({
                "hourly_fee_p" : hourly_fee_discount_configs[0]['hourly_fee'],
                "hourly_p_discount" : hourly_fee_discount_configs[0]['hourly_discount']
                })
        #会员钟点费优惠
        if member_class_id:
            tmp_context = [{k : v} for k,v in context]
            tmp_context.update({'member_class_id' : member_class_id})
            m_hourly_fee_p_discount_configs =  self.pool.get('ktv.member_hourly_fee_discount').get_active_configs(cr,uid,room.room_type_id.id,tmp_context)
            if m_hourly_fee_discount_configs:
                ret.update({
                    "is_member_hourly_fee" : True,
                    "hourly_fee" : m_hourly_fee_discount_configs[0]['hourly_fee'],
                    "hourly_discount" : m_hourly_fee_discount_configs[0]['hourly_discount']
                    })
        return ret

    def get_current_fee_tuple(self,cr,uid,room_id,context = None):
        """
        与get_current_fee相同,不过返回tuple对象,顺序是room_id,room_fee,minimum_fee,minimum_fee_p,minimum_persons,is_member_hourly_fee,hourly_fee,hourly_discount,hourly_fee_p,hourly_p_discount,
        """
        vals = self.get_current_fee(cr,uid,room_id,context)
        return (room_id,vals['room_fee'],vals['minimum_fee'],vals['minimum_fee_p'],vals['minimum_persons'],vals['is_member_hourly_fee'],vals['hourly_fee'],vals['hourly_discount'],vals['hourly_fee_p'],vals['hourly_p_discount'])

