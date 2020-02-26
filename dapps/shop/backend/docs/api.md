# API Endpoints

## Authentication & Store Management

Use the following for the test curl commands below:

    export COOKIE_STORAGE="/tmp/test-cookies.txt"
    export API_ROOT="http://127.0.0.1:3000"
    export DEFAULT_OPTIONS=(-vk)
    export JSON_POST_OPTIONS=(-v -X POST -H 'Content-Type: application/json')
    export JSON_DELETE_OPTIONS=(-v -X DELETE -H 'Content-Type: application/json')
    export KEY_AUTH_HEADER=(-H 'Authorization: bearer token123')

### `GET /auth`

Check if user is authenticated

    curl "${DEFAULT_OPTIONS[@]}" -b $COOKIE_STORAGE $API_ROOT/auth

### `GET /auth/:email`

Check for an existing seller account by E-mail address

    curl "${DEFAULT_OPTIONS[@]}" $KEY_AUTH_HEADER $API_ROOT/auth/me@example.com

### `POST /auth/login`

Authenticate a seller. Sessions tracked by cookies.

    curl "${JSON_POST_OPTIONS[@]}" -d '{ "email": "test@example.com", "password": "thisismypassword" }' -c $COOKIE_STORAGE $API_ROOT/auth/login

### `POST /auth/logout`

Destroy an authenticated session.

    curl "${DEFAULT_OPTIONS[@]}" -b $COOKIE_STORAGE $API_ROOT/auth/logout

### `POST /auth/registration`

Register a seller account.

    curl "${JSON_POST_OPTIONS[@]}" -d '{ "name": "Test User", "email": "test@example.com", "password": "thisismypassword" }' $API_ROOT/auth/registration

### `DELETE /auth/registration`

Delete a seller account.

    curl -v -X DELETE -b $COOKIE_STORAGE $API_ROOT/auth/registration

### `GET /shop`

List the shops for a seller.

    curl "${DEFAULT_OPTIONS[@]}" -b $COOKIE_STORAGE $API_ROOT/shop

### `POST /shop`

Create a shop with provided configuration.

    curl "${JSON_POST_OPTIONS[@]}" -b $COOKIE_STORAGE -d '{"name": "Test Shop", "listingId": "1-001-0001", "authToken": "token123"}' $API_ROOT/shop

### `DELETE /shop`

Delete a shop.

    curl "${JSON_DELETE_OPTIONS[@]}" -b $COOKIE_STORAGE -d '{"id": 123}' $API_ROOT/shop

### `GET /config/dump/:id`

Dump a config.  **NOTE:** Local testing only.

    curl "${DEFAULT_OPTIONS[@]}" -b $COOKIE_STORAGE $API_ROOT/config/dump/1

### `POST /config`

Update a shop config.

    curl $JSON_POST_OPTIONS -b $COOKIE_STORAGE -d '{ "shopId": 1, "config": { "stripeBackend": "sk_test_stRIPESECRETkey", "dataIrl": "http://ipfs.originprotocol.com/ipfs/QmNP2AXi1oaPkyLnjArNtcq5SGCGDBUiiNkCh5sxY122cr/", "printful": "PrintfulAPIKeY", "stripeWebhookSecret": "whsec_stipeWebhookSecret", "pgpPrivateKey": "-----BEGIN PGP PRIVATE KEY BLOCK-----\n\nArmoredPrivateKeyHERE\n-----END PGP PRIVATE KEY BLOCK-----", "pgpPrivateKeyPass": "decryptPassphrase" }' $API_ROOT/config

## Discounts

### `POST /check-discount`

Get a discount code's value and type

### `GET /discounts`
### `GET /discounts/:id`
### `POST /discounts`

Add a discount code

    curl "${JSON_POST_OPTIONS[@]}" "${KEY_AUTH_HEADER[@]}" -b $COOKIE_STORAGE -d '{"networkId": 4, "status": "active", "code": "asdf1234", "discountType": "percentage", "value": 15, "maxUses": 200, "onePerCustomer": false}' $API_ROOT/discounts

### `PUT /discounts/:id`
### `DELETE /discounts/:id`

## Orders

### `GET /orders`

Fetch orders for a store

    curl "${DEFAULT_OPTIONS[@]}" $KEY_AUTH_HEADER $API_ROOT/orders

### `GET /orders/:id`

Fetch a specific order

    curl "${DEFAULT_OPTIONS[@]}" $KEY_AUTH_HEADER $API_ROOT/orders/1-001-1

### `GET /orders/:id/printful`
### `POST /orders/:id/printful/create`
### `POST /orders/:id/printful/confirm`

## CC Payments

### `POST /pay`

Create a Stripe payment intent.

    curl "${JSON_POST_OPTIONS[@]}" $KEY_AUTH_HEADER -d '{ "amount": 100, "data": "asdf1234" }' $API_ROOT/pay

### `POST /webhook`
