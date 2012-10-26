# -*- coding: utf-8 -*-
#基于包厢类别的特殊日设置基础类
import logging
from osv import fields,osv

_logger = logging.getLogger(__name__)

class room_type_special_day(osv.osv):
    '''特殊日设置'''
    _name = "ktv.room_type_special_day"
    _description = "特殊日设置"

    _columns ={
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True,help="请选择包厢类别"),
            "special_day" : fields.date("special_day",required = True,help = "设置特殊日")
            }
    _defaults = {
            "special_day" : fields.date.context_today,
            }
