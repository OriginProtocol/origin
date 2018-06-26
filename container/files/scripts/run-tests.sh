#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pip install -r $DIR/../source/requirements.txt -q
su -c "source $DIR/../origin-bridge-venv/bin/activate && cd $DIR/../source && pytest $*" postgres
