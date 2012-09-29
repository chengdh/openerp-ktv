"""
    Openepr Console based on rconsole

    A Python console you can embed in a program and attach to remotely.
"""


import getopt
import sys
import os

import rfoo.utils.rconsole as rconsole


def print_usage():
    scriptName = os.path.basename(sys.argv[0])
    sys.stdout.write("""
Start remote console:
%(name)s [-h] [-pPORT]

-h, --help  Print this help.
-pPORT      Set PORT.
""" % {'name': scriptName})


def main():
    """Parse options and run script."""

    try:
        options, args = getopt.getopt(
            sys.argv[1:], 
            'hp:', 
            ['help']
            )
        options = dict(options)

    except getopt.GetoptError:
        print_usage()
        return 2

    if '-h' in options or '--help' in options:
        print_usage()
        return

    if '-p' in options:
        port = int(options.get('-p'))
    else:
        port = rconsole.PORT

    try:
      rconsole.interact(port=port)
    except:
        print ''

if __name__ == '__main__':
    main()
