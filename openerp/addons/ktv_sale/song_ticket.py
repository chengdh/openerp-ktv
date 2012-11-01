# -*- coding: utf-8 -*-
#欢唱券设置
from osv import fields, osv
import decimal_precision as dp
import ktv_helper

class song_ticket(osv.osv):
    _name = "ktv.song_ticket"
    _description = "欢唱券设置"

    _columns = {
            'name' : fields.char('name',size = 64,required = True),
            'room_type_id' : fields.many2one('ktv.room_type','room_type_id',help = "包厢类别"),
            'equal_minutes' : fields.integer('equal_minutes'),
            'active_time_limit' : fields.boolean('active_time_limit'),
            "time_from": fields.selection(ktv_helper.time_for_selection,"time_from",help = "欢唱券限制使用时间" ),
            "time_to": fields.selection(ktv_helper.time_for_selection,"time_to",help = "欢唱券限制使用时间" ),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active_time_limit' : False,
            }
