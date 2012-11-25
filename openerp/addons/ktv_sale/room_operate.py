# -*- coding: utf-8 -*-
from osv import osv,fields

class room_operate(osv.osv):
    '''
    包厢操作类:
    以下操作都属于包厢操作：
    1 预定
    2 正常开房
    3 买钟
    4 买断
    5 续钟
    6 退钟
    7 换房
    8 并房
    包厢通过cur_room_operate_id与room_operate相关联,用于标示当前包厢所对应的操作
    room_operate与以上各个操作是one2many的关系,这样通过一个room_operate可以获取所有包厢在开房过程中所进行的操作,结账时遍历所有的操作并进行计算即可
    '''
    _name = "ktv.room_operate"
    _rec_name = "bill_no"

    _description = "包厢操作类,与包厢是many2one的关系"

    _columns = {
            "operate_date" : fields.datetime('operate_datetime',required = True),
            "room_id" : fields.many2one('ktv.room','room_id',required = True),
            "bill_no" : fields.char("bill_no",size = 64,required = True,help = "账单号"),
            }

    _defaults = {
            'operate_date' : fields.datetime.now,
            'bill_no': lambda obj, cr, uid, context: obj.pool.get('ir.sequence').get(cr, uid, 'ktv.room_operate'),
            }
