#!/bin/bash

set -e

echo "Running database migrations for bridge"

flask db upgrade

echo "Starting bridge"

gunicorn \
	-b :5000 \
	--access-logfile - \
	--error-logfile - \
	main:app
