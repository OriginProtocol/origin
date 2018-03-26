import os
from app import app
from app import app_config
from config import constants
from util import patches

from flask_compress import Compress

from views import web_views

from flask_migrate import Migrate
from database import db

# Silence pyflakes
assert patches
assert web_views

# enable gzip since it's not supported out of the box on Heroku
Compress(app)

app_config.init_prod_app(app)

migrate = Migrate(app, db)

if __name__ == '__main__':
    app.debug = constants.DEBUG
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, threaded=True)
