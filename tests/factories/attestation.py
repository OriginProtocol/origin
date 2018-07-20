import datetime
from factory import alchemy, LazyFunction

from database import db
from database.db_models import VerificationCode
from util.time_ import utcnow


def get_future_expiry():
    return utcnow() + datetime.timedelta(seconds=20)


class VerificationCodeFactory(alchemy.SQLAlchemyModelFactory):
    class Meta(object):
        model = VerificationCode
        sqlalchemy_session = db.session  # the SQLAlchemy session object

    email = "hello@world.foo"
    code = "98765"
    expires_at = LazyFunction(get_future_expiry)
    created_at = LazyFunction(utcnow)
    updated_at = LazyFunction(utcnow)
