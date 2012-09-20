#!/usr/bin/env python
# -*- encoding: utf-8 -*-
##############################################################################
#
#    OpenERP, Open Source Management Solution
#    Copyright (C) 201Z Smile (<http://www.smile.fr>). All Rights Reserved
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
Add lines:
cd $WORKSPACE
python smile_addons/smile_test/jenkins/jenkins.py jenkins/jenkins.conf
into your jenkins shell command build
"""


import ConfigParser
import sys
import subprocess
import signal
import time
import xmlrpclib
import os
import ast
from pprint import pprint

from pylint import lint
from pylint.reporters.text import ParseableTextReporter


def load_config(filename, section='options'):
    p = ConfigParser.ConfigParser()
    with open(filename, 'r') as config_file:
        p.readfp(config_file)
        config = dict(p.items(section))
        for key, value in config.iteritems():
            if value.lower() in ('true', 'false'):
                config[key] = eval(value.capitalize())
        return config


def remove_file(filename):
    if os.access(filename, os.W_OK):
        os.remove(filename)


def update_addons_path(addons_path):
    curr_dir = os.getcwd()
    addons_list = []
    for addon in addons_path.split(','):
        if addon.startswith('/'):
            addons_list.append(addon)
        else:
            addons_list.append(curr_dir + '/' + addon)
    return ','.join(addons_list)


def build_openerp_conf_file(config, filename='openerp.conf'):
    with open(filename, 'w') as conffile:
        conffile.write('[options]\n')
        for key, value in config.items():
            if key == 'addons_path':
                value = update_addons_path(value)
            if key in ('db_user', 'db_password', 'db_host', 'db_port', 'addons_path',
                       'xmlrpc_port', 'admin_passwd', 'logfile', 'email_from',
                       'xmlrpcs', 'netrpc'):
                conffile.write('%s=%s\n' % (key, value))


class ServerProxy(object):
    def __init__(self, openerp_py_cmd, conffile='openerp.conf', log_level='INFO', log_handler=':INFO', test_disable=False, version='6.0'):
        self.openerp_conf = load_config(conffile)
        self.command = openerp_py_cmd
        self.conffile = conffile
        self.test_disable = test_disable
        self.version = version
        self.xmlrpc_port = self.openerp_conf.get('xmlrpc_port', 8069)
        self.admin_passwd = self.openerp_conf.get('admin_passwd', 'admin')
        self.log_level = log_level
        self.log_handler = log_handler
        self.sock_db = xmlrpclib.ServerProxy('http://localhost:%s/xmlrpc/db' % (self.xmlrpc_port))
        self.sock_common = xmlrpclib.ServerProxy('http://localhost:%s/xmlrpc/common' % (self.xmlrpc_port))
        self.popen = None

    def start(self):
        args = [self.command, '--config=%s' % self.conffile]
        if self.version == '6.0':
            args.append('--log-level=%s' % self.log_level)
        elif self.version == '6.1':
            args.append('--log-handler=%s' % self.log_handler)
        if self.test_disable:
            args.append('--test-disable')
        print args
        self.popen = subprocess.Popen(args)
        time.sleep(5)
        if not self.is_running():
            raise Exception('Error launching OpenERP: returncode=%s' % self.popen.returncode)

    def is_running(self):
        # First check for the return code then the /proc directory
        self.popen.poll()
        return not self.popen.returncode and os.path.exists('/proc/%s' % self.popen.pid)

    def kill(self):
        for sig in [signal.SIGINT, signal.SIGTERM, signal.SIGKILL]:
            if self.is_running():
                print 'signal: %s' % sig
                try:
                    self.popen.send_signal(sig)
                except OSError, e:
                    if self.is_running():
                        print "Server not killed yet ?!"
                        raise e
                time.sleep(5)

    def create_db_and_wait(self, dbname, demo=False, lang='en_US', user_password='admin'):
        print 'creating db:%s' % (dbname,)
        db_id = self.sock_db.create(self.admin_passwd, dbname, demo, lang, user_password)
        while True:
            progress = self.sock_db.get_progress(self.admin_passwd, db_id)[0]
            if progress == 1.0:
                break
            else:
                time.sleep(1)

    def create_db(self, dbname, demo=False, lang='en_US', user_password='admin'):
        self.create_db_and_wait(dbname, demo, lang, user_password)
        return OpenerpDatabase(self, dbname, user_password)

    def create_timed_db(self, demo=False, lang='en_US', user_password='admin'):
        dbname = 'testdb_%s' % (time.strftime('%Y%m%d_%H%M%S'),)
        return self.create_db(dbname, demo, lang, user_password)

    def drop_db(self, db_name):
        self.sock_db.drop(self.admin_passwd, db_name)


class OpenerpDatabase(object):
    def __init__(self, server, dbname, user_password='admin'):
        self.server = server
        self.dbname = dbname
        self.user_password = user_password
        sock = xmlrpclib.ServerProxy('http://localhost:%s/xmlrpc/object' % (self.server.xmlrpc_port))
        self.sock_exec = lambda * a: sock.execute(self.dbname, 1, self.user_password, *a)

    def install_modules(self, module_list=None):
        module_list = module_list or []
        self.sock_exec('ir.module.module', 'update_list')
        module_ids_to_install = []
        for module_name in module_list:
            module_ids = self.sock_exec('ir.module.module', 'search', [('name', '=', module_name)])
            if not module_ids:
                raise Exception('Module %s does not exist' % (module_name))
            module_ids_to_install.append(module_ids[0])
        self.sock_exec('ir.module.module', 'button_install', module_ids_to_install)
        mem_id = self.sock_exec('base.module.upgrade', 'create', {})
        self.sock_exec('base.module.upgrade', 'upgrade_module', [mem_id])

    def drop(self):
        self.server.drop_db(self.dbname)


class Many2OneRequiredOnDelete(ast.NodeVisitor):
    def __init__(self, *args, **kwargs):
        self.linenos = []
        super(Many2OneRequiredOnDelete, self).__init__(*args, **kwargs)

    def visit(self, node):
        # Check for a call, that is an attribute (like fields.*) and whose name is many2on (like fields.many2one)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'many2one':
            required_true = False
            ondelete_defined = False
            for keyword in node.keywords:
                if keyword.arg == 'required' and keyword.value.id == 'True':
                    required_true = True
                if keyword.arg == 'ondelete':
                    ondelete_defined = True
            if required_true and not ondelete_defined:
                self.linenos.append(node.lineno)
        return super(Many2OneRequiredOnDelete, self).visit(node)


class  CheckPrintPdb(ast.NodeVisitor):
    def __init__(self, *args, **kwargs):
        self.linenos = []
        super(CheckPrintPdb, self).__init__(*args, **kwargs)

    def visit(self, node):
        if isinstance(node, ast.Print):
            self.linenos.append((node.lineno, 'print'))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute) and node.func.attr == 'set_trace':
            self.linenos.append((node.lineno, 'pdb'))
        return super(CheckPrintPdb, self).visit(node)



class SourceDir(object):
    # TODO: accepter une liste de dir avec split sur ',' ?
    # puis pour chaque test: delete(*_file) puis open en mode 'a' pour rajouter les trucs dans le fichier ?
    # pour certains oui mais pour d'autres pas la peine, ils acceptent une liste de dossier

    def __init__(self, source_dir, conf):
        if not os.path.isdir(source_dir):
            raise Exception("%s does not seem to be a valid directory" % source_dir)
        self.source_dir = source_dir
        self.conf = conf
        self.python_files = []
        for dirpath, dirnames, filenames in os.walk(self.source_dir):
            for filename in filenames:
                if filename.endswith('.py'):
                    self.python_files.append(os.path.join(dirpath, filename))

    def static_code_check(self):
        # SLOCCOUNT
        if self.conf.get('sloccount_file'):
            self.sloccount(self.conf['sloccount_file'])
        # Clonedigger
        if self.conf.get('clonedigger_file'):
            self.clonedigger(self.conf['clonedigger_file'])
        # PEP8
        if self.conf.get('pep8_file'):
            self.pep8_check(self.conf['pep8_file'])
        # Pyflakes
        if self.conf.get('pyflakes_file'):
            self.pyflakes(self.conf['pyflakes_file'], True)
        # Pylint
        if self.conf.get('pylint_file'):
            self.pylint(self.conf['pylint_file'])
        # Many2one required=True without ondelete
        if self.conf.get('m2o_required_ondelete_file'):
            self.m2o_required_ondelete_check(self.conf.get('m2o_required_ondelete_file'))
        # Check Print and Pdb
        if self.conf.get('check_print_pdb_file'):
            self.check_print_pdb(self.conf.get('check_print_pdb_file'))

    def sloccount(self, sloccount_file):
        remove_file(sloccount_file)
        if not os.path.exists('sloccount'):
            os.mkdir('sloccount')
        with open(sloccount_file, 'w') as sloccountfile:
            subprocess.call(['sloccount', '--wide', '--details', '--datadir', 'sloccount', self.source_dir, ], stdout=sloccountfile)

    def clonedigger(self, clonedigger_file):
        remove_file(clonedigger_file)
        args = ['clonedigger', '--cpd-output', '--output=%s' % clonedigger_file]
        if self.conf.get('min-similarity-lines'):
            args.append('--size-threshold=%s' % self.conf.get('min-similarity-lines'))
        args.append(self.source_dir)
        subprocess.call(args)

    def pep8_check(self, pep8_file):
        remove_file(pep8_file)
        with open(pep8_file, 'w') as pep8file:
            args = ['pep8']
            if self.conf.get('max-line-length'):
                args.append('--max-line-length=%s' % self.conf.get('max-line-length'))
            args.append(self.source_dir)
            subprocess.call(args, stdout=pep8file)

    def pyflakes(self, pyflakes_file, ignore_init=True):
        remove_file(pyflakes_file)
        with open(pyflakes_file, 'a') as pyflakesfile:
            for filename in self.python_files:
                if ignore_init and '__init__.py' in filename:
                    continue
                subprocess.call(['pyflakes', filename], stdout=pyflakesfile)

    def pylint(self, pylint_file, pylint_rc_file=None, ignore_openerp=True):
        remove_file(pylint_file)
        with open(pylint_file, 'w') as pylintfile:
            args = [fname for fname in self.python_files if not ignore_openerp or '__openerp__.py' not in fname]
            if self.conf.get('max-line-length'):
                args.append('--max-line-length=%s' % self.conf.get('max-line-length'))
            if self.conf.get('min-similarity-lines'):
                args.append('--min-similarity-lines=%s' % self.conf.get('min-similarity-lines'))
            if self.conf.get('sys_path_for_pylint'):
                sys.path.extend(self.conf.get('sys_path_for_pylint').split(','))
            for key, value in conf.items():
                if key == 'pylint_file':
                    continue
                if key.startswith('pylint_'):
                    args.append('--%s=%s' % (key[7:], value))
            if pylint_rc_file:
                args.append('--rcfile=%s' % pylint_rc_file)
            lint.Run(args, ParseableTextReporter(pylintfile), exit=False)

    def m2o_required_ondelete_check(self, m2o_required_ondelete_file):
        remove_file(m2o_required_ondelete_file)
        errors_found = {}
        for filename in self.python_files:
            with open(filename) as python_file:
                try:
                    tree = ast.parse(python_file.read())
                    m2o_checker = Many2OneRequiredOnDelete()
                    m2o_checker.visit(tree)
                    errors_found[filename] = m2o_checker.linenos
                except Exception, e:
                    print 'Error parsing file: %s: %s' % (filename, repr(e))
        with open(m2o_required_ondelete_file, 'w') as m2o_required_ondeletefile:
            for filename, linenos in errors_found.items():
                for lineno in linenos:
                    m2o_required_ondeletefile.write('%s:%s :fields.many2one required=True without any ondelete\n' % (filename, lineno))

    def check_print_pdb(self, check_print_pdb_file):
        """Checks for print and/or pdb statements"""
        remove_file(check_print_pdb_file)
        errors_found = {}
        for filename in self.python_files:
            with open(filename) as python_file:
                try:
                    tree = ast.parse(python_file.read())
                    chk_print_pdb = CheckPrintPdb()
                    chk_print_pdb.visit(tree)
                    errors_found[filename] = chk_print_pdb.linenos
                except Exception, e:
                    print 'Error parsing file: %s: %s' % (filename, repr(e))
        with open(check_print_pdb_file, 'w') as check_print_pdb_file:
            for filename, linenos in errors_found.items():
                for lineno, error in linenos:
                    if error == 'print':
                        check_print_pdb_file.write('%s:%s :print statement\n' % (filename, lineno))
                    else:
                        check_print_pdb_file.write('%s:%s :pdb set_trace()\n' % (filename, lineno))

if __name__ == '__main__':
    assert len(sys.argv) == 2 and sys.argv[1], "config-file is mandatory"
    conf = load_config(sys.argv[1])
    print "Conf:\n", pprint(conf)
    build_openerp_conf_file(conf, 'openerp.conf')
    remove_file(conf['logfile'])

    # Source Static Checks
    source_dir = SourceDir(conf['source_dir'], conf)
    source_dir.static_code_check()

    # Start OpenERP
    # disable_test, since we will run them through smile_test
    server = ServerProxy(conf['manual_launch_command'], conffile='openerp.conf',
                         log_level='test', log_handler=':WARNING', test_disable=True, version=conf.get('openerp_version', '6.0'))
    server.start()
    # Create test database
    db = server.create_timed_db(demo=conf.get('demo', True), lang=conf.get('lang', 'fr_FR'), user_password='admin')
    try:
        db.install_modules(['smile_test'])
        server.sock_common.coverage_start(True, source_dir.python_files)
        # Install config's modules
        module_list = conf['module_list'].split(',')
        db.install_modules(module_list)
        time.sleep(5)
        ignore_tests = conf.get('ignore_tests', False)
        if ignore_tests:
            try:
                ignore_tests = eval(ignore_tests)
            except (NameError, SyntaxError):
                ignore_tests = False
        db.sock_exec('smile.test', 'test_to_xunitfile', 'all', conf['xunit_file'], ignore_tests)
        time.sleep(5)
        server.sock_common.coverage_stop_and_save(conf.get('coverage_file'), source_dir.python_files)
        time.sleep(1)
    finally:
        # Drop db
        db.drop()
    # Kill OpenERP
    server.kill()
