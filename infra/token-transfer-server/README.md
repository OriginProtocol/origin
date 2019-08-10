#### Instructions to start the server

###### Configure your environment

```
export SESSION_SECRET="Don't tell anyone."
export ENCRYPTION_SECRET="It's a secret"
export SENDGRID_FROM_EMAIL="Origin Protocol <support@shoporigin.com>"
export SENDGRID_API_KEY="<SendGrid key>"
```

##### Configure your database
SQLite
```
export DATABASE_URL="sqlite:///Users/franck/src/origin/infra/token-transfer-server/data/t3.db"
```
Postgres
```
export DATABASE_URL="postgres://origin:origin@localhost/origin"
```

Run migration & seed data
yarn run migration
yarn run seed

##### Start the server
```
yarn run start
```

##### Additional environment variables for production

```
export PORTAL_URL="https://<url>
```
