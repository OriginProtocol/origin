import datetime


def unix_to_datetime(unix_timestamp):
    return datetime.datetime.utcfromtimestamp(
        int(unix_timestamp)
    )
