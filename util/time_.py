import datetime

from dateutil import tz

def utcnow():
    return datetime.datetime.now(tz.tzutc())
