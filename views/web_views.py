from flask import render_template

from app import app


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/redirects/facebook/')
def facebook():
    return render_template('redirects/facebook.html')


@app.route('/redirects/twitter/')
def twitter():
    return render_template('redirects/twitter.html')
