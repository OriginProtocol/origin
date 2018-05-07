from flask_restful import Api
from api.routes import init_routes


def start_restful_api(app):
    api = Api(app)
    init_routes(api)
    return api
