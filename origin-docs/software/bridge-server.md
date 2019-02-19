---
layout: page
title: Bridge Server
nav_weight: 80
category: Software
---

The Origin Bridge Server handles the server side of identity attestations.

Most traditional web APIs, such as those from Facebook and Twitter, can only interact with a centralized server located at a specific domain. A decentralized application, like our Origin Demo DApp, doesn't need to "live" on a particular server. (In fact, you can load it from any IPFS gateway!) Thus, in order for the DApp to use an "old world" API, it needs a Bridge Server.

Origin hosts a Bridge Server, but in the true spirit of decentralization, anyone is free to clone our open source code and host their own.

You can connect to and use our hosted Bridge Server at [bridge.originprotocol.com](https://bridge.originprotocol.com). The `staging` branch of this repo is available at [staging.bridge.originprotocol.com](https://staging.bridge.originprotocol.com) and the `master` branch of this repo is available at [dev.bridge.originprotocol.com](https://dev.bridge.originprotocol.com).

DApps can connect to the Bridge Server of their choosing to handle tasks like issuing identity attestations and decryptying data that is returned from third-party services like Civic. We also need proxies for fetching public data from services like Facebook and Twitter which require authentication keys.

## API documentation

See the [Attestation API](../../reference/origin-js/attestations.html)

## One-time Setup

### Prerequisites
- Python 3.5 or higher required
- Postgresql 9.3 or higher required

#### Mac OS specifics
Install build tools packages:
```bash
brew install automake autoconf libtool
```

### Set Up A Virtual Environment

```bash
git clone https://github.com/OriginProtocol/origin.git && cd origin/origin-bridge

python3 -m venv ve

source ve/bin/activate

pip install -r requirements.txt
```

### Clone the Starter Configuration Variables

```bash
cp dev.env .env
```
Adjust the values in .env now and in the future to suit your local environment. 

For [EnvKey](https://www.envkey.com/) support, set ENVKEY to the key of the
generated local development key.

#### Flask secret
Set ```FLASK_SECRET_KEY``` to your unique Flask secret key. Use a unique Flask secret key per environment. Flask suggests that
```python -c "import os; print(os.urandom(24))"```
is a perfectly reasonable way to generate a secret key.

#### Database
Set up your ```DATABASE_URL``` to point to where you local database is or will be.

#### Identity attestation
Attestation account used by the bridge server to sign attestation:
 - ATTESTATION_ACCOUNT: Ethereum address of the account used for signing.
 - ATTESTATION_SIGNING_KEY: Ethereum private key of the account used for signing.
Attestation providers configuration:
- [Facebook](https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow)
  - FACEBOOK_CLIENT_ID
  - FACEBOOK_CLIENT_SECRET
- [Sendgrid](https://sendgrid.com/docs/Classroom/Send/How_Emails_Are_Sent/api_keys.html)
  - SENDGRID_API_KEY
  - SENDGRID_FROM_EMAIL
- [Twilio](https://www.twilio.com/docs/usage/your-request-to-twilio)
  - TWILIO_VERIFY_API_KEY (Can be generated from your [Twilio account](https://www.twilio.com/console/verify/applications))
- [Twitter](https://developer.twitter.com/en/docs/basics/authentication/guides/access-tokens)
  - TWITTER_CONSUMER_KEY
  - TWITTER_CONSUMER_SECRET

#### Production configuration
When deploying to a production system, make sure to set appropriate environment
variables, in your .env file, notably

```bash
DEBUG=0
HTTPS=1
HOST=<your-prod-host>
FLASK_SECRET_KEY=<unique-key>
PROJECTPATH=/app  # For Heroku
```

### Set Up Your Database

```bash
createdb <db-name>  # Anything you want, perhaps bridge-server
```

Make sure the DB name you used is indicated in your ```DATABASE_URL``` in the `.env` file.
Example: `DATABASE_URL`=`postgresql://localhost:5432/bridge-server`


```bash
# Applies all migrations to make the DB current. Works even on an empty database.
#
# Run this in the virtual environment you set up above.
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
# Run this in the virtual environment you set up above.
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
| [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/OriginProtocol/origin/tree/master/origin-bridge) | [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/OriginProtocol/origin/tree/master/origin-bridge) |

Heroku will prompt you to set config variables. At a minium, you must set these three:

|Config          |Value|
|----------------|------|
|FLASK_SECRET_KEY|(make something up)|
|PROJECTPATH     |/app|
|HOST            |(domain name of your dev heroku app)|

See the `dev.env` file for a full list of other optional config variables.


We use following buildpacks:

  heroku buildpacks:set heroku/python
