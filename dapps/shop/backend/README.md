# Deploy to Heroku

Setup new heroku app

    git push heroku master
    heroku addons:create heroku-postgresql:hobby-dev
    heroku addons:create sendgrid:starter

    heroku config:set PUBLIC_URL=
    heroku config:set DATA_URL=
    heroku config:set ADMIN_PW=
    heroku config:set NETWORK_ID=
    heroku config:set PROVIDER=
    heroku config:set WEB3_PK=
    heroku config:set PGP_PRIVATE_KEY_PASS=
    heroku config:set PGP_PRIVATE_KEY='<PASTE_MULTI_LINE>'

    heroku addons:open sendgrid

    # Settings -> API Keys -> Create API Key
    # API Key name: heroku
    # Create and View
    # Copy key
    # Go back to terminal

    heroku config:set SENDGRID_API_KEY=<PASTE VALUE>
