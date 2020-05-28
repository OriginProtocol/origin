# Backend Docuemntation

- [Web API Docs](api.md)

## Environment Variables

These are the available environment variables:

- `ENCRYPTION_KEY` - A randomish string used to encrypt config in the DB. This is required.
- `PROVIDER` - Web3 (JSON-RPC) provider URL to use
- `NETWORK` ['mainnet', 'rinkeby', 'dev']
- `IPFS_GATEWAY` - IFPS gateway override. Ignores shop configs if set.
- `SESSION_SECRET` - String used as salt to encrypt session data.  Defaults to random.
- `REDIS_URL` - Connection string for Redis. If empty, shop will skip queuing and retrying tasks.
- `DATABASE_URL` - Database connection. If empty will use a local SQLite database.

## Single Tenant Configuration

First, create a seller and shop for the single-tenant:

    bash backend/data/create_single_tenant.sh Mike mike@example.com asdf1234 "My Store" "1-001-1"

Then, make create its configuration from an existing .env file:

    ENCRYPTION_KEY="asdf" node backend/data/configFromEnv.js -e .env

## Manual Testing

### Test Data

    INSERT INTO shops (name, auth_token, config, createdAt, updatedAt) values ('testshop', 'asdf1234', '{}', datetime('now'), datetime('now'));
    --- password below is 'asdf1234'
    INSERT INTO sellers (name, email, password, createdAt, updatedAt) VALUES ('Test User', 'test@example.com', '$2b$10$CUJAArlpmVNzEC0/sdSQLOlu9l7uqLfGbOwbaQdUQZ5.MWuY/88KS', datetime('now'), datetime('now'));
