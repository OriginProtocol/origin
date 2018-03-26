web: bin/start-nginx newrelic-admin run-program gunicorn -c nginx/gunicorn.conf main:app
worker: celery -A util.tasks worker
