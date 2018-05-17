![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

# bridge-server

The Origin bridge server connects the old world to the new.

You can connect to and use our hosted bridge server at [bridge.originprotocol.com](https://bridge.originprotocol.com). The `develop` branch of this repo is available at [dev.bridge.originprotocol.com](https://dev.bridge.originprotocol.com).

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

### Prerequisites
- Python 3.5 or higher required
- Postgresql 9.3 or higher required
- Redis 4.0+ recommended

#### Mac OS specifics
Install build tools packages:
```bash
brew install automake autoconf libtool
```

### Set Up A Virtual Environment

```bash
git clone https://github.com/OriginProtocol/bridge-server.git
cd bridge-server

python3 -m venv ve

source ve/bin/activate

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

Enviroment keys for Indexing server:
- RPC_SERVER: Set this to RPC server URL, you want the indexing server to listen to events on.
- RPC_PROTOCOL: Different connection protocols for RPC server. Options are `https` or `wss`

  example configurations:
    - Rinkeby:
      RPC_SERVER: `wss://rinkeby.infura.io/_ws`
      RPC_PROTOCOL: `wss`

    - Connecting to local RPC server:
      RPC_SERVER: `http://127.0.0.1:8545/`
      RPC_PROTOCOL: `https`

- IPFS_DOMAIN: Set this to domain of an IPFS daemon. for example `127.0.0.1` or `gateway.originprotocol.com`
- IPFS_PORT: port on which the IPFS daemon is listening.
- REDIS_URL: Set this to point to your local Redis server. For example `redis://127.0.0.1:6379/0`

If you wish to setup push notification for your mobile apps
- APNS_CERT_FILE: Apple notification service certificate(This needs to be .pem file. Refer to http://www.apptuitions.com/generate-pem-file-for-push-notification/ for how to generate)
- APNS_CERT_PASSWORD: Passphrase for the pem file if you do not strip it out when you exported to pem
- APNS_APP_BUNDLE_ID: The bundle id of your app

FCM support forthcoming

### Set Up Your Database

```bash
createdb <db-name>  # Anything you want, perhaps bridge-server
```

Make sure the DB name you used is indicated in your ```DATABASE_URL``` in the `.env` file.
Example: `DATABASE_URL`=`postgresql://localhost:5432/bridge_server`


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

### Run the Celery worker

```bash
celery -A util.tasks worker -c=1
celery -A util.tasks beat
```

This starts a celery beat to issue periodic tasks and a celery worker to process the tasks.


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
