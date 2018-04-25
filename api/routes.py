from api.modules import verification


def add_resources(api, resources, namespace):
    for path, resource in resources.items():
        api.add_resource(resource, namespace + path)


def init_routes(api):
    # add routes for new modules here
    add_resources(api, verification.resources, '/api/verification/')
