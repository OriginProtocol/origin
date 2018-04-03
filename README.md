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

Adjust the values in .env now and in the future to suit your local environment. In particular, set up your ```SQLALCHEMY_DATABASE_URI```
to point to where you local database is or will be.

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
createdb <db-name>  # Anything you want, perhaps origin-bridge
```

Make sure the DB name you used is indicated in your ```SQLALCHEMY_DATABASE_URI```.

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

```bash
python testing/all_tests.py
```

**Problems?** Hit us up in the `engineering` channel on [Discord](https://www.originprotocol.com/discord) if you need help.

## Contributing

Please send your pull requests to the `develop` branch. Everything on `master` should be live at `bridge.originprotocol.com`

## Database changes

We use [Flask Migrate](https://flask-migrate.readthedocs.io/en/latest/) to handle database revisions. If you make changes to the database, use

```bash
FLASK_APP=main.py flask db migrate
```

to generate the required migration file. Rename it to add a description of the change after the underscore. Then run

```bash
FLASK_APP=main.py flask db migrate
```

to apply your migration to your local database, then test your changes before committing.

## Dev Deployment on Heroku

To deploy a dev server on Heroku, you'll follow the normal steps you would to deploy on Heroku.

As a minium, you must set these three Heroku config variables:

|Config          |Value|
|----------------|------|
|FLASK_SECRET_KEY|(make something up)|
|PROJECTPATH     |/app|
|HOST            |(domain name of your dev heroku app)|

There are more optional config variables you can set. See [dev.env](dev.env) for a full list.
