release: FLASK_APP=main.py flask db upgrade
web: waitress-serve --port=$PORT main:app
init: python tools/manage.py db init
migrate: python tools/manage.py db migrate
upgrade: python tools/manage.py db upgrade
worker: celery -A util.tasks worker --concurrency=1
beat: celery -A util.tasks beat
