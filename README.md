![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# bridge-server

The Origin bridge server connects the old world to the new.

Origin Dapps can connect to the bridge server of their choosing in order to enable the following functionality which is either impossible or impractical to do directly onchain, including:

### Indexing

Searching, browsing or filtering results is impractical to do either onchain or in the browser. Dapps can connect to a bridge-server to solve this problem. The bridge server will index the blockchain and related JSON content that is stored on IPFS into a quickly queriable format to make searching and filtering results possible from DApps.

### Identity

We need a centralized server that can handle tasks like issuing identity attestations and decryptying data that is returned from third-party services like Civic. We also need proxies for fetching public data from services like Facebook and Twitter which require authentication keys.

### Notifications

There is currently no practical way to get email or text notifications when your bookings are made without a centralized monitoring service that can send you a text or an email to let you know about listings you care about.

## API documentation

See the [README for the API](api)

## One-time Setup

### Set Up A Virtual Environment

```bash
# python2
virtualenv /path/to/environment
# python3
python3 -m venv /path/to/environment

cd /path/to/environment
git clone https://github.com/OriginProtocol/bridge-server.git
cd bridge-server
source ../bin/activate
pip install -r requirements.txt
```

### Clone the Starter Configuration Variables

```python
cp dev.env .env

```
Adjust the values in .env now and in the future to suit your local environment. In particular, set up your ```DATABASE_URL```
to point to where you local database is or will be.

You'll need to set a few API keys:
- [Facebook](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
  - FACEBOOK_CLIENT_ID
  - FACEBOOK_CLIENT_SECRET
- [Sendgrid](https://sendgrid.com/docs/Classroom/Send/How_Emails_Are_Sent/api_keys.html)
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
- [Twilio](https://www.twilio.com/docs/usage/your-request-to-twilio)
  - TWILIO_ACCOUNT_SID
  - TWILIO_AUTH_TOKEN
  - TWILIO_NUMBER (Can be added on [this page](https://www.twilio.com/user/account/phone-numbers/))
- [Twitter](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens)
  - TWITTER_CONSUMER_KEY
  - TWITTER_CONSUMER_SECRET

For EnvKey support set ENVKEY to the key of the generated local developement key

When deploying, set appropriate environment variables for production, notably

```bash
DEBUG=0
HTTPS=1
HOST=<your-prod-host>
FLASK_SECRET_KEY=<unique-key>
PROJECTPATH=/app  # For Heroku
```

Use a unique Flask secret key per environment. Flask suggests that ```python -c "import os; print(os.urandom(24))"```
is a perfectly reasonable way to generate a secret key.

### Set Up Your Database

```bash
createdb <db-name>  # Anything you want, perhaps bridge-server
```

Make sure the DB name you used is indicated in your ```DATABASE_URL```.

```bash
# Applies all migrations to make the DB current. Works even on an empty database.
FLASK_APP=main.py flask db upgrade
```

## Every Time You Develop

### Set Up Your Shell

```bash
cd /path/to/environment/project
source ../bin/activate
export PYTHONPATH=.
```

It's handy to save bash alias for this. Consider adding in your ```~/.bash_profile```:

```bash
alias myenv='cd /path/to/environment/project && source ../bin/activate && export PYTHONPATH=.'
```

### Run the Server

```bash
python main.py
```

This starts a development server on ```localhost:5000``` by default.

### Run the Tests

Throughout the development process and before committing or deploying, run:

```bash
pytest --flakes --codestyle
```

Run individual test files simply as:

```bash
pytest path/to/test.py
```

Run a single test case, or an individual test, using:

```bash
pytest path/to/test.py::test_case_name
```

**Problems?** Hit us up in the `engineering` channel on [Discord](https://www.originprotocol.com/discord) if you need help.

### Code Formatting

We are using [pycodestyle](https://github.com/PyCQA/pycodestyle) to enforce code formatting. The tests will throw errors when code is not formatted properly, when using the `--codestyle` option.

To automatically format the code:

```
autopep8 --in-place --recursive --a --a .
```

## Contributing

Please send your pull requests to the `develop` branch. Everything on `master` should be live at `bridge.originprotocol.com`

## Database changes

We use [Flask Migrate](https://flask-migrate.readthedocs.io/en/latest/) to handle database revisions. If you make changes to the database, use

```bash
FLASK_APP=main.py flask db migrate
```

to generate the required migration file. Rename it to add a description of the change after the underscore. Then run

```bash
FLASK_APP=main.py flask db upgrade
```

to apply your migration to your local database, then test your changes before committing.


## Heroku Deploy

To deploy a development copy of the site on Heroku, just choose which branch you would like to use and follow the instructions: 

| `Master` branch <br>(stable) | `Develop` branch<br> (active development) | 
|---------|----------|
| [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/OriginProtocol/bridge-server/tree/master) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/OriginProtocol/bridge-server/tree/develop) | 

Heroku will prompt you to set config variables. At a minium, you must set these three:

|Config          |Value|
|----------------|------|
|FLASK_SECRET_KEY|(make something up)|
|PROJECTPATH     |/app|
|HOST            |(domain name of your dev heroku app)|

See [dev.env](dev.env) for a full list of other optional config variables.


We use following buildpacks:

  heroku buildpacks:set heroku/python
