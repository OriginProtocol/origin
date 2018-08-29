from api.modules import (
    attestations,
    notifications,
)


def add_resources(api, resources, namespace):
    for path, resource in resources.items():
        api.add_resource(resource, namespace + path)


def init_routes(api):
    # add routes for new modules here
    add_resources(api, attestations.resources, '/api/attestations/')
    add_resources(api, notifications.resources, '/api/notifications/')
