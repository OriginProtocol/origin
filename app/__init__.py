from flask import Flask
from flask_cors import CORS
from util.encoder import JSONEncoder
from werkzeug.contrib.fixers import ProxyFix

from config import settings


class MyFlask(Flask):
    def get_send_file_max_age(self, name):
        # This disables caching for static js and css files,
        # which is helpful for development.
        # In production you may either want to disable this an used versioned
        # compiled static files,
        # or serve static files from a CDN.
        if name.startswith('js/') or name.startswith('css/'):
            return 0
        return super(MyFlask, self).get_send_file_max_age(name)

    # Temporary workaround for https://github.com/pallets/flask/pull/1910
    # If you access the jinja_env during startup, then template reloading
    # doesn't necessarily get enabled. We don't actually explictly
    # reference jinja_env during startup, we simply register a custom filter,
    # so unclear why this triggers the bug, but I guess filter registration
    # requires the jinja_env.
    def create_jinja_environment(self):
        self.config['TEMPLATES_AUTO_RELOAD'] = settings.DEBUG
        return super(MyFlask, self).create_jinja_environment()


app = MyFlask(__name__,
              template_folder=settings.TEMPLATE_ROOT,
              static_folder=settings.STATIC_ROOT)
app.json_encoder = JSONEncoder
app.wsgi_app = ProxyFix(app.wsgi_app)

cors = CORS(app,
            resources={r"/api/*": {"origins": "*"}},
            supports_credentials=True)
