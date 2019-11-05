#### Instructions to start the server

###### Configure your environment

```
export SESSION_SECRET="Don't tell anyone."
export ENCRYPTION_SECRET="It's a secret"
export SENDGRID_FROM_EMAIL="Origin Protocol <support@shoporigin.com>"
export SENDGRID_API_KEY="<SendGrid key>"
export DATABASE_URL="postgres://origin:origin@localhost/origin"
```

Run migration
```
yarn run migrate
```

##### Start the server
```
yarn run start
```

##### Additional environment variables for production

```
export PORTAL_URL="https://<url>
```