# -*- coding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2010 OpenERP s.a. (<http://openerp.com>).
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
    'name': 'Smile Test',
    'version': '0.1',
    'category': 'Tools',
    'description': """Module used in conjunction with Jenkins CI for unit test
    and code coverage mesurement""",
    'author': 'Smile',
    'website': 'http://www.smile.fr',
    'depends': ['base'],
    'init_xml': [],
    'update_xml': [],
    'test': ['test/fields_view_get_test.yml',
             'test/detect_cascade_invalidation.yml'],
    'installable': True,
    'active': False,
    'web': False,
}
