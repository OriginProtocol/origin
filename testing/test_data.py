from dateutil import parser as dateparser
from fixture import DataSet
from fixture import SQLAlchemyFixture

from database import db
from database import db_models


class VerificationCodeData(DataSet):
    class code1(object):
        eth_address = 562046206989085878832492993516240920558397288279
        phone = '1112223456'
        email = 'hello@world.foo'
        code = '98765'
        expires_at = dateparser.parse('2018-04-01T00:30:00+00:00')
        created_at = dateparser.parse('2018-04-01T00:00:00+00:00')
        updated_at = dateparser.parse('2018-04-01T00:00:00+00:00')


def setup_testdata(connectable):
    dbfixture = SQLAlchemyFixture(
        engine=connectable or db.engine,
        env={
            'VerificationCodeData': db_models.VerificationCode,
        })
    fixture_datas = [
        dbfixture.data(VerificationCodeData),
    ]
    return dbfixture, fixture_datas
