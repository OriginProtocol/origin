# bridge-server

The Origin bridge server connects the old world to the new. 

Origin Dapps can connect to the bridge server of their choosing in order to enable the following functionality which is either impossible or impractical to do directly onchain, including:

### Indexing 

Searching, browsing or filtering results is impractical to do either onchain or in the browser. Dapps can connect to a bridge-server to solve this problem. The bridge server will index the blockchain and related JSON content that is stored on IPFS into a quickly queriable format to make searching and filtering results possible from DApps. 

### Identity

We need a centralized server that can handle tasks like issuing identity attestations and decryptying data that is returned from third-party services like Civic. We also need proxies for fetching public data from services like Facebook and Twitter which require authentication keys.

### Notifications

There is currently no practical way to get email or text notifications when your bookings are made without a centralized monitoring service that can send you a text or an email to let you know about listings you care about. 

## Installing

This is a Python Flask app. The code is all `Python 3.6.4` with `Postgres` for the database.

Setup a virtualenv
```
virtualenv bridge-server && cd bridge-server
```

Clone
```
git clone https://github.com/OriginProtocol/bridge-server.git && cd bridge-server
```

Enter virtual environment
```
source env.sh
```

Install requirements
```
pip install -r requirements.txt
```

Rename the file `sample.env` to `.env`, and update env variables as desired.
```
mv sample.env .env
```

Run it!
```
python main.py
```

Open browser to view
```
open http://127.0.0.1:5000/
```

**Problems?** Hit us up in the `engineering` channel on [Discord](https://www.originprotocol.com/discord) if you need help.

## Contributing

Please send your pull requests to the `develop` branch. Everything on `master` should be live at `bridge.originprotocol.com`

## Database changes

We use [Flask Migrate](https://flask-migrate.readthedocs.io/en/latest/) to handle database revisions. If you make changes to the database, use `flask db migrate` to generate the required migration file and then `flask db upgrade` to implement and test your changes on your local database before committing.

## Dev Deployment on Heroku

To deploy a dev server on Heroku, you'll follow the normal steps you would to deploy on Heroku, with two additional steps.

After the normal setup and linking, you'll need to ensure the site uses both the python and the nginx backend:

	heroku buildpacks:set heroku/python
	heroku buildpacks:add https://github.com/heroku/heroku-buildpack-nginx

As a minium, you must set these three Heroku config variables:

|Config          |Value|
|----------------|------|
|FLASK_SECRET_KEY|(make something up)|
|PROJECTPATH     |/app|
|HOST            |(domain name of your dev heroku app)|

There are more optional config variables you can set. See [sample.env](sample.env) for a full list.


