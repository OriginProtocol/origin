import os
import sys

import dotenv

if '_test.py' in sys.argv[0] or 'tests.py' in sys.argv[0]:
    dotenv.load_dotenv('testing/test.env')
else:
    dotenv_filename = dotenv.find_dotenv()
    if dotenv_filename:
        dotenv.load_dotenv(dotenv_filename)


def parse_bool(env_value):
    return env_value is not None and env_value.lower() not in ('0', 'false')


def abspath(relative_file_path):
    return os.path.join(PROJECTPATH, relative_file_path)


DEBUG = parse_bool(os.environ.get('DEBUG'))

HOST = os.environ.get('HOST')
HTTPS = parse_bool(os.environ.get('HTTPS'))
PROJECTPATH = os.environ.get('PROJECTPATH') or os.getcwd()
FLASK_SECRET_KEY = os.environ.get('FLASK_SECRET_KEY')
PUBLIC_ID_ENCRYPTION_KEY = os.environ.get('PUBLIC_ID_ENCRYPTION_KEY')

DATABASE_URL = os.environ.get('DATABASE_URL')
TEST_DATABASE_URI = os.environ.get(
    'TEST_DATABASE_URI',
    'postgresql://localhost/unittest')

TEMPLATE_ROOT = os.path.join(PROJECTPATH, 'templates')
STATIC_ROOT = os.path.join(PROJECTPATH, 'static')

FACEBOOK_CLIENT_ID = os.environ.get('FACEBOOK_CLIENT_ID')
FACEBOOK_CLIENT_SECRET = os.environ.get('FACEBOOK_CLIENT_SECRET')

FROM_EMAIL = os.environ.get('FROM_EMAIL')

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_NUMBER = os.environ.get('TWILIO_NUMBER')

RPC_SERVER = os.environ.get('RPC_SERVER')
RPC_PROTOCOL = os.environ.get('RPC_PROTOCOL')

IPFS_DOMAIN = os.environ.get('IPFS_DOMAIN')
IPFS_PORT = os.environ.get('IPFS_PORT')
