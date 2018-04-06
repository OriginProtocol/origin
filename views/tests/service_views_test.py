import json
import unittest

import mock

from testing import test_base
from views import service_views
assert service_views  # Silence pyflakes

class ServiceViewsTest(test_base.DatabaseWithTestdataTest):

    def send_json_post(self, url, json_data, headers=None):
        return self.client.post(url, data=json.dumps(json_data),
            content_type='application/json', headers=headers)

    @mock.patch('logic.verification_service.send_code_via_sms')
    def test_verification_service(self, mock_send_code_via_sms):
        req = {'eth_address': '0x123', 'phone': '5551231212'}
        resp = self.send_json_post('/api/verification_service/generate_phone_verification_code', req)
        self.assertEqual(200, resp.status_code)
        self.assertEqual('SUCCESS', resp.json['response_code'])

if __name__ == '__main__':
    unittest.main()
