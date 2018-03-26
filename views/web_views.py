from collections import OrderedDict
from datetime import datetime

from flask import (jsonify, redirect, render_template,
                   request, flash, g, url_for, Response)
import os
from app import app
from config import constants, universal

@app.before_request
def beforeRequest():
    """ Processing of URL before any routing """
    # Force https on prod
    if constants.HTTPS:
        if not request.url.startswith('https'):
            return redirect(request.url.replace('http', 'https', 1))
    if request.view_args and 'lang_code' in request.view_args:
        if request.view_args['lang_code'] in constants.LANGUAGES:
            # Pull off current language from URL
            g.current_lang = request.view_args['lang_code']
            request.view_args.pop('lang_code')
        else:
            # Possible old style URL without language prefix
            # e.g. /blah --> /en/blah
            return redirect("/%s/%s" % (get_locale(), request.view_args['lang_code']), code=302)


@app.route('/')
def root():
    return render_template('index.html')

@app.route('/robots.txt')
def robots():
    return app.send_static_file('files/robots.txt')

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.context_processor
def inject():
    return {'now': datetime.utcnow(), 'universal':universal}
