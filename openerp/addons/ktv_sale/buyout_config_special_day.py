# -*- coding: utf-8 -*-
#买断特殊日设置
import logging
from osv import fields,osv
from datetime import date

_logger = logging.getLogger(__name__)

class buyout_config_special_day(osv.osv):
    '''买断特殊日设置'''
    _name = "ktv.buyout_config_special_day"
    _description = "买断特殊日设置"

    _columns ={
            "room_type_id" : fields.many2one("ktv.room_type","room_type_id",required = True,help="请选择包厢类别"),
            "special_day" : fields.date("special_day",required = True,help = "设置特殊日,在该日期,买断包厢时将按照特殊日设置的买断费收取")
            }
    _defaults = {
            "special_day" : fields.date.context_today,
            }
