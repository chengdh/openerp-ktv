# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 2011 Smile (<http://www.smile.fr>). All Rights Reserved
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU General Public License for more details.
#
#    You should have received a copy of the GNU General Public License
#    along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
##############################################################################

try:
    import coverage
except ImportError:
    raise ImportError('Please install coverage package')

from service.web_services import common
from release import major_version

native_dispatch = common.dispatch


def coverage_start(branch=True, source=None):
    if not hasattr(common, 'coverage'):
        # Ignore __openerp__.py files and web addons
        omits = ['*/__openerp__.py', '/*/__openerp__.py', '*/web/*', '/*/web/*']
        common.coverage = coverage.coverage(branch=branch, source=source, omit=omits)
        common.coverage.start()
        return True
    return False


def coverage_stop_and_save(output_file=None, morfs=None):
    """ output_file: to specify where the xml result will be saved
    morfs: list of files to be included in the coverage
    """
    if hasattr(common, 'coverage'):
        common.coverage.stop()
        common.coverage.save()
        if output_file:
            common.coverage.xml_report(morfs=morfs, outfile=output_file, ignore_errors=True)
        del common.coverage
        return True
    return False


def new_dispatch_6_0(self, method, auth, params):
    if method == 'coverage_start':
        return coverage_start(*params)
    elif method == 'coverage_stop_and_save':
        return coverage_stop_and_save(*params)
    else:
        return native_dispatch(self, method, auth, params)


def new_dispatch_6_1(self, method, params):
    if method == 'coverage_start':
        return coverage_start(*params)
    elif method == 'coverage_stop_and_save':
        return coverage_stop_and_save(*params)
    else:
        return native_dispatch(self, method, params)


if major_version == '6.0':
    common.dispatch = new_dispatch_6_0
elif major_version == '6.1':
    common.dispatch = new_dispatch_6_1
