from pyuca import Collator
from flask import request
from config import constants

def get_real_ip():
    """
    Returns the client IP from the headers, fallbacks to remote_addr
    """
    if 'X-Forwarded-For' in request.headers:
        return request.headers.getlist("X-Forwarded-For")[0].rpartition(' ')[-1]
    else:
        return request.remote_addr or 'untrackable'

def file_get_contents(filename):
    """
    Returns file contents as a string.
    """
    with open(filename) as file:
        return file.read()

def concat_asset_files(filenames):
    """
    Concats css or javascript files together with a comment containing the filename
    at the top of each file.
    """
    contents = ["/* %s */\n\n %s" % (filename, file_get_contents(filename)) for filename in filenames]
    return "\n\n;\n\n".join(contents) 