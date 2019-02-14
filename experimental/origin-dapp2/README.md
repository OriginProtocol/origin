![Origin Protocol](data/origin-header.png)

A UI leveraging origin-graphql. View and manage listings and offers.

Test builds at https://originprotocol.github.io/test-builds/

## Usage

    npm start

## User Profile
  Stored in IPFS and pulled using a GraphQL query in `/origin-dapp2/src/queries/Identity.js`
  Social media attestations are returned as a JSON string and must be parsed.