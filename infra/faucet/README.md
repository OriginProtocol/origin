Our Origin testnet faucet provides OGN for developers on TestNets. The faucet is deployed at [faucet.staging.originprotocol.com](https://faucet.staging.originprotocol.com)

## Code structure

  - faucet: Web application that implements a faucet for Origin tokens.
  - lib: Common code.
  - test: Unit tests.

## Using the faucet in local environment

You can start the faucet using either docker or lerna.

### Lerna

  Make sure to have Postgres installed and running locally.
  
  Run migration files to create the DB tables.
  
        export DATABASE_URL=postgres://origin:origin@localhost/origin
        lerna run migrate --scope origin-faucet 

  Bootstrap lerna
  
        lerna bootstrap
        
  Start a local blockchain
  
        lerna run start --scope origin --stream
        
  Start the faucet server
  
        lerna run start --scope origin-faucet --stream
        
 ### Access the faucet
   The server should start and you can point your browser to http://localhost:5000 to access the faucet web UI.
