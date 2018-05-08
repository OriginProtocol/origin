import os

import dotenv

dotenv_filename = dotenv.find_dotenv()
if dotenv_filename:
    dotenv.load_dotenv(dotenv_filename)

env_key = os.environ.get("ENVKEY")
if env_key:
    # if ENVKEY is set load up envkey
    # NOTE: this actually load_dotenv twice in the __init__ file.
    # Also seems to imply .env use is dev only. May need a PR to
    # resolve that issue
    __import__("envkey")


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

SENDGRID_FROM_EMAIL = os.environ.get('SENDGRID_FROM_EMAIL')

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')

TWILIO_ACCOUNT_SID = os.environ.get('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.environ.get('TWILIO_AUTH_TOKEN')
TWILIO_NUMBER = os.environ.get('TWILIO_NUMBER')

RPC_SERVER = os.environ.get('RPC_SERVER')
RPC_PROTOCOL = os.environ.get('RPC_PROTOCOL')

IPFS_DOMAIN = os.environ.get('IPFS_DOMAIN')
IPFS_PORT = os.environ.get('IPFS_PORT')

TWITTER_CONSUMER_KEY = os.environ.get('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.environ.get('TWITTER_CONSUMER_SECRET')

ORIGIN_SIGNING_KEY = os.environ.get('ORIGIN_SIGNING_KEY')

REDIS_URL = os.environ.get('REDIS_URL')
CELERY_DEBUG = parse_bool(os.environ.get('CELERY_DEBUG'))
