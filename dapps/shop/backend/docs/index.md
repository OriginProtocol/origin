# Backend Docuemntation

- [Web API Docs](api.md)

## Environment Variables

These are the available environment variables:

- `DATA_URL` - single tennant only, otherwise use stored config
- `SESSION_SECRET` - String used as salt to encrypt session data.  Defaults to random.
- `NETWORK` ['mainnet', 'rinkeby', 'dev']
- `PROVIDER` - Web3 (JSON-RPC) provider URL to use
- `IPFS_GATEWAY` - IFPS gateway oerride

## Manual Testing

### Test Data

    INSERT INTO shops (name, auth_token, config, createdAt, updatedAt) values ('testshop', 'asdf1234', '{}', datetime('now'), datetime('now'));
    --- password below is 'asdf1234'
    INSERT INTO sellers (name, email, password, createdAt, updatedAt) VALUES ('Test User', 'test@example.com', '$2b$10$CUJAArlpmVNzEC0/sdSQLOlu9l7uqLfGbOwbaQdUQZ5.MWuY/88KS', datetime('now'), datetime('now'));
