#!/usr/bin/env bash

pythonbrew switch 2.7.3
pythonbrew venv use OPENERP
python openerp/addons/smile_test/jenkins/jenkins.py ~/.openerp_serverrc
