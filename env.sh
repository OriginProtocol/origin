# Sets up the current environment for development.
#
# Usage:
#   $ source env.sh
#   # Works from any location as well:
#   $ source /path/to/environment/env.sh
#
# Sets the python path to include the python directory
# of this project, so that imports can be written as relative,
# but you can still run scripts interactively from the commandline.
# Also activates the virtualenv for this project.

ENV_DIR=$(cd $(dirname ${BASH_SOURCE[0]}) && pwd)
export PROJECTPATH=$ENV_DIR
if [[ -n "$VIRTUAL_ENV" ]]; then
    deactivate
fi
source "$ENV_DIR/../bin/activate"
if [[ $PYTHONPATH != *"$ENV_DIR"* ]]
then
    export PYTHONPATH="$ENV_DIR:$PYTHONPATH"
fi
cd $ENV_DIR

export FLASK_APP=main.py

echo "Using virtual environment $VIRTUAL_ENV with project path $PROJECTPATH."
