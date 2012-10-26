# -*- coding: utf-8 -*-
#价格类型
import logging
from osv import fields,osv

_logger = logging.getLogger(__name__)

class price_class(osv.osv):
    '''价格类型,不同的价格类型对应不同的时段钟点费'''
    _name = "ktv.price_class"
    _description = "价格类型"

    _columns ={
            "name" : fields.char("name",size = 64,required = True),
            "description" : fields.text("description",size = 255),
            "sequence" : fields.integer("sequence"),
            "active": fields.boolean("active"),
            }
    _defaults = {"active" : True}
