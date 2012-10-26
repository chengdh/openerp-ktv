# -*- coding: utf-8 -*-
from osv import fields, osv

class room_area(osv.osv):
    _name = "ktv.room_area"
    _description = "包厢所属区域定义"

    _columns = {
            'name' : fields.char('name',size = 64,required = True),
            'description' : fields.text('description',size = 255),
            'active' : fields.boolean('active'),
            }
    _defaults = {
            'active' : True,
            }

