import urllib
import urlparse

from config import constants

def absurl(relative_url):
    protocol = 'https' if constants.HTTPS else 'http'
    return '%s://%s%s' % (protocol, constants.HOST, relative_url)

def append_params(url, params):
    parsed = urlparse.urlparse(url)
    parsed_params = urlparse.parse_qs(parsed.query)
    for name, value in params.iteritems():
        param_list = parsed_params.get(name)
        if param_list is None:
            param_list = parsed_params[name] = []
        param_list.append(value)
    new_parsed = list(parsed)
    new_parsed[4] = urllib.urlencode(parsed_params, doseq=True)
    return urlparse.urlunparse(new_parsed)

def replace_params(url, params):
    parsed = urlparse.urlparse(url)
    parsed_params = urlparse.parse_qs(parsed.query)
    for name, value in params.iteritems():
        parsed_params[name] = [value]
    new_parsed = list(parsed)
    new_parsed[4] = urllib.urlencode(parsed_params, doseq=True)
    return urlparse.urlunparse(new_parsed)
