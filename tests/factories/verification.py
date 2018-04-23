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

    eth_address = 1246920381690549211058421991838046914431377695997
    phone = "5551231212"
    code = "98765"
    expires_at = LazyFunction(get_future_expiry)
    created_at = LazyFunction(utcnow)
    updated_at = LazyFunction(utcnow)
