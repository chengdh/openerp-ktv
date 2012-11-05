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
            'active' : fields.boolean('active'),
            }

    _defaults = {
            'room_fee' : 0,
            'hourly_fee' : 0,
            'minimum_fee' : 0,
            'hourly_fee_p' : 0,
            'minimum_fee_p' : 0,
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
