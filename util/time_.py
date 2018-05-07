import datetime

from dateutil import tz


def utcnow():
    return datetime.datetime.now(tz.tzutc())


def unix_to_datetime(unix_timestamp):
    return datetime.datetime.utcfromtimestamp(
        int(unix_timestamp)
    )
