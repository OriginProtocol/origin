# Origin Validator

Origin Protocol JSON Schema validator.

## Usage

```
import validator from '@origin/validator'

const data = {
  "schemaId": "https://schema.originprotocol.com/offer_1.0.0.json",
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

const isValid = validator(data, "https://schema.originprotocol.com/offer_1.0.0.json")

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
