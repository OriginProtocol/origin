from views import web_views # noqa


def test_index(client):
    resp = client.get('/')
    assert resp.status_code == 200