# -*- coding: utf-8 -*-
#打折卡 不记名
from osv import fields, osv
import ktv_helper

class discount_card(osv.osv):
    '''打折卡信息设置'''
    _name = "ktv.discount_card"
    _descripton = "打折卡"

    _columns ={
            "card_no" : fields.char("card_no",size = 30,readonly = True,select = True,help="卡号",required = True),
            "discount_card_type_id" : fields.many2one("ktv.discount_card_type","discount_card_type_id",required = True,select = True,help="打折卡类别"),
            "make_fee" : fields.float("make_fee",digits =  (10,2),help = "制卡费用,默认取会员等级中的制卡费用"),
            "valid_date" : fields.date("valid_date",help="卡有效期"),
            "active" : fields.boolean("active"),
            }

