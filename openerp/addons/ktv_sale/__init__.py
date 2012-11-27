# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2004-2010 Tiny SPRL (<http://tiny.be>).
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as
#    published by the Free Software Foundation, either version 3 of the
#    License, or (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################
import fee_type
import fee_type_member_class_discount
import pay_type
import room
import room_area
import room_type
import room
import room_operate     #包厢操作对象
import room_scheduled   #包厢预定对象
import room_opens       #开房对象
import room_type_special_day
import buyout_config
import buyout_config_special_day
import buffet_config
import buffet_config_special_day
import minimum_fee_config
import minimum_fee_config_special_day
import price_class
import hourly_fee_discount
import hourly_fee_discount_special_day
import hourly_fee_p_discount
import hourly_fee_p_discount_special_day
import hourly_fee_promotion
import member_hourly_fee_discount
import member_hourly_fee_discount_special_day
import member_class     #会员卡等级设置
import member           #会员信息设置
import member_class_change_config  #会员升降级设置
import discount_card_type   #打折卡
import song_ticket          #欢唱券
import sales_voucher_type   #抵用券类型
import sales_voucher   #抵用券登记
import wizard
import report

# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
