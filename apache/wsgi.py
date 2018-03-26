import os
import sys

root = os.path.join(os.path.dirname(__file__), '..')
sys.path.insert(0, root)

os.environ['PROJECTPATH'] = root

# Activate the virtual env
activate_env=os.path.expanduser(root + "/../bin/activate_this.py")
execfile(activate_env, dict(__file__=activate_env))

from main import app as application
assert application  # Silence pyflakes
