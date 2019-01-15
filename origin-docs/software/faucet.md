---
layout: page
title: Testnet Faucet
category: Software
---

Our Origin testnet faucet provides OGN for developers on TestNets. The faucet is deployed at [faucet.originprotocol.com](https://faucet.originprotocol.com)

## Code structure

  - faucet: Web application that implements a faucet for Origin tokens.
  - lib: Common code.
  - test: Unit tests.

## Using the faucet in local environment

### Prerequisite

  Use origin-box to start an origin-js container.

      docker-compose up origin-js

### Starting the server

 Start the server in the origin-js container

     docker exec -w /app/token origin-js node faucet/app.js --network_ids=999

  The server should start and you can point your browser to http://localhost:5000 to access the faucet web UI.
