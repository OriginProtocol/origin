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
    host = None
    port = None
    if settings.BIND_HOST:
        if ':' in settings.BIND_HOST:
            host, port_str = settings.BIND_HOST.split(':')
            port = int(port_str)
        else:
            host = settings.HOST
    app.run(host=host, port=port, debug=app.debug)
