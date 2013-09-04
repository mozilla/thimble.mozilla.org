#! /usr/bin/env python

"""
    In the ../vendor/codemirror2 directory is a mini-distribution of
    CodeMirror which contains only the files necessary for HTML editing. It
    can be updated with this Python script.
"""

import os
import sys

if len(sys.argv) < 2:
    print "usage: %s <path-to-new-codemirror-directory>" % sys.argv[0]
    sys.exit(1)

rootdir = os.path.dirname(os.path.abspath(__file__))

NEW_CODEMIRROR_PATH = sys.argv[1]
OUR_CODEMIRROR_PATH = os.path.join(rootdir, "..", "vendor", "codemirror2")

for dirpath, dirnames, filenames in os.walk(OUR_CODEMIRROR_PATH):
    for filename in filenames:
        ourpath = os.path.join(dirpath, filename)
        relpath = os.path.relpath(ourpath, OUR_CODEMIRROR_PATH)
        newpath = os.path.join(NEW_CODEMIRROR_PATH, relpath)
        if os.path.exists(newpath):
            print "copying %s" % newpath
            open(ourpath, "wb").write(open(newpath, "rb").read())
