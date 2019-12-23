# Dshop Backend

## Deploy to Heroku

Make sure your `.env` file has all the values you want to see configured.  Make
sure your PGP keys are base64 encoded (see below).  If you're satisfied with the
configuration(it can be changed later), run the deploy script:

    ./deploy_heroku.sh myAppName

### Don't forget

Configure a stripe webhook with your new Heroku URL, then set
`STRIPE_WEBHOOK_SECRET` to the generated signing secret given by Stripe.

### Old Notes

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

## PGP/GPG Key Export

Export key pair in base64 with no newlines:

    gpg --list-keys
    gpg --armor --export KEY_ID | base64 -w0
    gpg --armor --export-secret-key KEY_ID | base64 -w0