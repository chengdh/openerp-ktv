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

"""
Requirements: coverage
"""

import time
import os.path
import inspect
import traceback
import xml.etree.ElementTree as ElementTree

from osv import osv
import pooler
import tools
import addons
from release import major_version


class SmileTest(osv.osv_memory):
    _name = 'smile.test'

    def get_all_installed_module_list(self, cr, states):
        cr.execute("SELECT name from ir_module_module WHERE state IN %s", (tuple(states),))
        return [name for (name,) in cr.fetchall()]

    def build_test_list_from_modules(self, module_list):
        assert isinstance(module_list, list), 'Module list should be a list'
        module_test_files = {}
        for module_name in module_list:
            if major_version == '6.1':
                from modules.module import load_information_from_description_file
                info = load_information_from_description_file(module_name)
            else:
                info = addons.load_information_from_description_file(module_name)
            module_test_files[module_name] = info.get('test', [])
        return module_test_files

    def _run_test(self, cr, module_name, filename):
        _, ext = os.path.splitext(filename)
        pathname = os.path.join(module_name, filename)
        open_file = tools.file_open(pathname)
        if ext == '.sql':
            queries = open_file.read().split(';')
            for query in queries:
                new_query = ' '.join(query.split())
                if new_query:
                    cr.execute(new_query)
        elif ext == '.csv':
            tools.convert_csv_import(cr, module_name, pathname, open_file.read(), idref=None, mode='update', noupdate=False)
        elif ext == '.yml':
            tools.convert_yaml_import(cr, module_name, open_file, idref=None, mode='update', noupdate=False)
        else:
            tools.convert_xml_import(cr, module_name, open_file, idref=None, mode='update', noupdate=False)

    def test_suite_to_xunit(self, test_suite):
        xml_testsuite = ElementTree.Element('testsuite')
        for attr in test_suite:
            if attr != 'test_cases':
                xml_testsuite.attrib[attr] = unicode(test_suite[attr])
        for test_case in test_suite['test_cases']:
            xml_testcase = ElementTree.SubElement(xml_testsuite, 'testcase')
            for attr in test_case:
                if attr != 'error':
                    xml_testcase.attrib[attr] = unicode(test_case[attr])
            if test_case['error']:
                error = ElementTree.SubElement(xml_testcase, 'error')
                error.text = test_case['error']['stack_trace']
                error.attrib['type'] = test_case['error']['type']
                error.attrib['message'] = test_case['error']['message']
            if test_case['skipped']:
                skipped = ElementTree.SubElement(xml_testcase, 'skipped')
        return ElementTree.tostring(xml_testsuite, encoding='utf8')


    def build_error_msg(self, traceback_msg, frame_list):
        # Yaml traceback do not work, certainly because of the compile clause
        # that messes up line numbers
        error_msg = traceback_msg
        deepest_frame = frame_list[-1][0]

        possible_yaml_statement = None
        locals_to_match = ['statements', 'code_context', 'model']
        for frame_inf in frame_list:
            frame = frame_inf[0]
            for local_to_match in locals_to_match:
                if local_to_match not in frame.f_locals:
                    break
            else:
                # all locals found ! we are in process_python function
                possible_yaml_statement = frame.f_locals['statements']

        if possible_yaml_statement:
            numbered_line_statement = ""
            for index, line in enumerate(possible_yaml_statement.split('\n'), start=1):
                numbered_line_statement += "%03d>  %s\n" % (index, line)
            yaml_error = "For yaml file, check the line number indicated in the traceback against this statement:\n%s"
            yaml_error = yaml_error % numbered_line_statement

            error_msg += '\n\n%s' % yaml_error
        error_msg += """\n\nLocal variables in deepest are: %s """ % repr(deepest_frame.f_locals)
        return error_msg

    def test(self, cr, uid, module_list='all', xunit=True, ignores=None, context=None):
        """
        module_list should equal 'all' or a list of module name
        ignores is a dict containing: {'module1': ['test_file_to_ignore1', 'test_file_to_ignore2' ], 'module2': ...}
        """
        if module_list == 'all' or 'all' in module_list:
            module_list = self.get_all_installed_module_list(cr, ('installed', 'to upgrade'))
        # get a dict containing: {'module1': ['test_file1', 'test_file2' ], 'module2': ...}
        module_test_files = self.build_test_list_from_modules(module_list)

        ignores = ignores or {}

        new_cr = pooler.get_db(cr.dbname).cursor()

        test_suite = {'name': 'smile.test',
                      'tests': 0,
                      'errors': 0,
                      'failures': 0,
                      'skip': 0,
                      'test_cases': [], }
        try:
            for module_name in module_test_files:
                ignored_files = ignores.get(module_name, [])
                for filename in module_test_files[module_name]:
                    test_case = {'classname': module_name,
                                 'name': filename,
                                 'time': 0,
                                 'error': {},
                                 'skipped': filename in ignored_files}
                    start = time.time()
                    test_suite['tests'] += 1
                    if not test_case['skipped']:
                        try:
                            self._run_test(new_cr, module_name, filename)
                        except Exception, e:
                            test_suite['errors'] += 1
                            traceback_msg = traceback.format_exc()
                            frame_list = inspect.trace()

                            test_case['error'] = {'type': str(type(e)),
                                                  'message': repr(e),
                                                  'stack_trace': self.build_error_msg(traceback_msg, frame_list), }
                    else:
                        test_suite['skip'] += 1

                    test_case['time'] = (time.time() - start)
                    test_suite['test_cases'].append(test_case)
                new_cr.rollback()
        finally:
            new_cr.close()
        if xunit:
            return self.test_suite_to_xunit(test_suite)
        return test_suite

    def test_to_xunitfile(self, cr, uid, module_list, filename, ignores=None, context=None):
        with open(filename, 'w') as xunit_file:
            xunit_str = self.test(cr, uid, module_list, xunit=True, ignores=ignores, context=context)
            xunit_file.write(xunit_str)
        return True

    # used to ignore basic invalidating scheme like store=True
    invalidating_functions_code_to_ignore = [f.__code__.co_code for f in
                                             (lambda obj, cr, uid, ids: ids, # ~lambda self, cr, uid, ids, c={}: ids
                                              lambda *a : [])] # ~lambda self, cr, uid, ids, c={}: []

    def _get_invalidating_fields(self, model_name):
        res = []
        for model_field_tuple in self.pool._store_function.get(model_name, []):
            if model_field_tuple[2].__code__.co_code not in self.invalidating_functions_code_to_ignore:
                res.append((model_field_tuple[0], model_field_tuple[1]))
        return res

    def detect_cascade_on_delete_on_invalidation(self, cr, uid, verbose=True):
        """ Returns the list of model that can be deleted through a postgres ONDELETE CASCADE,
        while having to invalidate stored function fields
        """
        cascadable_model = {}
        result = {}
        if major_version == '6.1':
            models = self.pool.models.values()
        else:
            models = self.pool.obj_pool.values()
        for model_obj in models:
            for field_name, field in model_obj._columns.items():
                if field.ondelete == 'cascade':
                    cascadable_model.setdefault(model_obj._name, {}).setdefault(field._obj, []).append(field_name)
        for model in cascadable_model:
            invalidating_fields = self._get_invalidating_fields(model)
            for field_inv in invalidating_fields:
                for parent_model in cascadable_model[model]:
                    if field_inv not in self._get_invalidating_fields(parent_model):
                        result.setdefault(parent_model, list())
                        if field_inv not in result[parent_model]:
                            result[parent_model].append(field_inv)
        if verbose:
            for res in result:
                print "The model {0} can be be deleted but the following field(s) refer(s) to it: ".format(res)
                for model, field in result[res]:
                    print "\tField {1}, carried by model {0}".format(model, field)
            print "Total: {}".format(len(result))
        return result

SmileTest()
