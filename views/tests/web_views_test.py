import unittest

from testing import test_base
from views import web_views
assert web_views  # Silence pyflakes

class WebViewsTest(test_base.DatabaseWithTestdataTest):

    def test_index(self):
        resp = self.client.get('/')
        self.assertEqual(200, resp.status_code)
        self.assertIn('<title>Title</title>', resp.data.decode('utf-8'))

if __name__ == '__main__':
    unittest.main()
