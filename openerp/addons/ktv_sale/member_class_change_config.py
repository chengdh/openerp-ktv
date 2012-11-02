# -*- coding: utf-8 -*-
#会员升降级设定
from osv import osv,fields

class member_class_change_config(osv.osv):
    _name = "ktv.member_class_change_config"
    _description = "根据会员积分高低自动升降级别的设置"

    _columns = {
            "member_class_id" : fields.many2one('ktv.member_class','member_class_id',required = True,help = "会员等级"),
            'date_from' : fields.date('date_from',help = "规则有效起始时间",required = True),
            'date_to' : fields.date('date_from',help = "规则有效结束时间",required = True),
            'up_points' : fields.integer('up_points',help = "升级累计积分",required = True),
            'up_member_class_id' : fields.many2one('ktv.member_class',"up_member_class_id",required = True,help = "升级会员类别"),
            'down_points' : fields.integer('down_points',required = True,help = "降级累计积分"),
            'down_member_class_id' : fields.many2one('ktv.member_class',"down_member_class_id",required = True,help = "降级会员类别"),
            'active' : fields.boolean('active'),

            }

    _defaults = {
            'date_from' : fields.date.context_today,
            'date_to' : fields.date.context_today,
            }
