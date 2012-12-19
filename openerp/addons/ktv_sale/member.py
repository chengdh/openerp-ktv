# -*- coding: utf-8 -*-
#会员信息
from osv import fields, osv
import ktv_helper
import decimal_precision as dp

class member(osv.osv):
    '''会员信息设置'''
    _name = "ktv.member"
    _descripton = "会员等级设置"

    _rec_name = "member_no"
    _columns ={
            "member_no" : fields.char("member_no",size = 30,readonly = True,select = True,help="会员编号,由系统自动生成",required = True),
            "name" : fields.char("name",size = 20,required = True,help = "会员名称"),
            "member_class_id" : fields.many2one("ktv.member_class","member_class_id",select = True,required = True,help = "会员等级"),
            "member_card_no" : fields.char("card_id",size = 30,select= True,required = True,help = "会员卡号,卡具上印刷的编号"),
            "photo" : fields.binary("photo",filter=".jpg,.png,.bmp"),
            "make_fee" : fields.float("make_fee",digits =  (10,2),help = "制卡费用,默认取会员等级中的制卡费用"),
            "valid_date" : fields.date("valid_date",help="卡有效期"),
            "overdraft_fee" : fields.float("overdraft_fee",digits = (10,2),help="可透支额度"),
            "card_password" : fields.char("card_password",size = 20,required = True,help = "卡密码,不可为空"),
            "phone" : fields.char("phone",size = 20,help="联系电话"),
            "birthday" : fields.date("birthday",help="联系电话"),
            "sex" : fields.selection(ktv_helper.sexes_for_select,"sex",help="性别"),
            "id_type" : fields.selection(ktv_helper.id_types_for_select,"id_type",help="证件类型"),
            "id_no" : fields.char("id_no",size = 30,help="证件号码"),
            "v_no" : fields.char("v_no",size = 30,help="车牌号码"),
            "qq" : fields.char("qq",size = 30,help="QQ号码"),
            "email" : fields.char("email",size = 30,help="邮件地址"),
            "company" : fields.char("company",size = 30,help="工作单位"),
            "address" : fields.char("address",size = 60,help="地址"),
            "balance" : fields.float("balance", digits_compute= dp.get_precision('Ktv Room Default Precision'),readonly = True,help = "卡余额"),
            "active" : fields.boolean("active"),
            }
    _defaults = {
            "active" : True,
            "make_fee" : 0,
            "overdraft_fee" : 0,
            'member_no': lambda obj, cr, uid, context: obj.pool.get('ir.sequence').get(cr, uid, 'ktv.member'),
            'balance' : 0,
            }
