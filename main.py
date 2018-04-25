from app import app
from app import app_config
from config import settings
from util import patches

from views import web_views

# Silence pyflakes
assert patches
assert web_views

app_config.init_prod_app(app)

if __name__ == '__main__':
    app.debug = settings.DEBUG
    app.run()
