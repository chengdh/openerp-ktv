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
{
    'name': 'KTV收银管理',
    'version': '0.1',
    'category': 'ktv',
    "sequence": 6,
    'description': """
    ktv 收银系统
===================================================

主要功能 :
---------------
    * 基础数据设置.
    * 预售(买钟、买断).
    * 正常销售.
    * 收银结账.
    * 换房、并房操作.
    * 优惠打折处理.
    * 会员结账处理
    """,
    'author': '程东辉',
    'images': [],
    'depends': ["base", "process", "decimal_precision"],
    'init_xml': [],
    'update_xml': [
        'views/base.xml',
        'views/fee_type.xml',
        'views/pay_type.xml',
        'views/room_area.xml',
        'views/room_type.xml',
        'views/room.xml',
        'views/hourly_fee_discount.xml',
        'views/hourly_fee_discount_special_day.xml',
        'views/hourly_fee_p_discount.xml',
        'views/hourly_fee_p_discount_special_day.xml',
        'views/member_hourly_fee_discount.xml',
        'views/member_hourly_fee_discount_special_day.xml',
        'views/buyout_config.xml',
        'views/buyout_config_special_day.xml',
        'views/buffet_config.xml',
        'views/buffet_config_special_day.xml',
        'views/minimum_fee_config.xml',
        'views/minimum_fee_config_special_day.xml',
        'views/hourly_fee_promotion.xml',
        'views/price_class.xml',
        'views/member_class.xml',
        'views/member_class_change_config.xml',
        'views/discount_card_type.xml',
        'views/song_ticket.xml',
        'views/sales_voucher_type.xml',
        'views/sales_voucher.xml',
        'ktv_data.xml'
        ],
    'demo_xml': [
        'test/ktv_test_data.yml',
        'test/member_test_data.yml',
            ],
    'test': [
        'test/ktv_test_data.yml',
        'test/member_test_data.yml',
        'test/ktv_room_test.yml',
        ],
    'installable': True,
    'application': True,
    # Web client
    'js': [
            'static/lib/backbone/backbone-0.5.3.js',
            'static/lib/bootstrap/js/bootstrap.js',
            'static/lib/jQuery.printElement/jquery.printElement.js',
            'static/lib/jquery-timer/jquery.timer.js',
            'static/src/js/form2json.js',
            'static/src/js/app.js',
            'static/src/js/model.js',
            'static/src/js/widget.js',
            'static/src/js/helper.js',
            ],
    'css': [
            'static/lib/bootstrap/css/bootstrap.css',
            'static/src/css/override.css',
            ],
    'qweb': [
            'static/src/xml/ktv_sale.xml',
            'static/src/xml/ktv_print.xml',
            ],

}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
