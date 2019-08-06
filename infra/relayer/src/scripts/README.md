# Origin Relayer Scripts

This is a collection of scripts useful in debugging relayer and IdentityProxy
transactions.

## `decode-tx.js`

This script will decode a contract call given a transaction hash.

### Usage

    node infra/relayer/src/scripts/decode-tx.js [transaction_hash]

## `predict-address.js`

Predicts the deployed address of a user's IdentityProxy.

### Usage

    node infra/relayer/src/scripts/predict-address.js [user_address]

## `verify-sig.js`

Will verify the signature of an IdentityProxy call.

### Usage

    node infra/relayer/src/scripts/verify-sig.js [to] [from] [signature] [txData] [nonce]

## `relayer-stats.js`

Shows transaction statistics for relayer accounts.

### Usage

    API_KEY=[etherscan_api_key] node infra/relayer/src/scripts/relayer-stats.js [child_account1] [child_account2...]
