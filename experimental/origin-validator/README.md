# Origin Validator

Origin Protocol JSON Schema validator.

## Usage

```
import validator from 'origin-validator'

const data = {
  "schemaId": "http://schema.originprotocol.com/offer_v1.0.0",
  "listingType": "unit",
  "unitsPurchased": 1,
  "totalPrice": {
    "currency": "ETH",
    "amount": "0.033"
  },
  "commission": {
    "currency": "OGN",
    "amount": "0"
  }
}

const isValid = validator(data, "http://schema.originprotocol.com/offer_v1.0.0")

```

## Available Schemas

- listing
- listing-withdraw
- offer
- offer-accept
- offer-withdraw
- dispute
- review
- notification
- profile
- resolution
