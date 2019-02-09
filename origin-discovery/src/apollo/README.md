# To start the Apollo GraphQL server
You can start the listener using either docker compose or lerna.

## Docker compose
Start the origin-discovery container.

    docker-compose up origin-discovery

## Lerna

### Prerequisite
 - Setup Postgres locally.
 - Run migration scripts to create the schema
 ```
lerna run migrate --scope origin-discovery
```
 - Install Elasticsearch locally.
 - Create the Elasticsearch schema
 ```
 cd origin/src/origin-discovery/devops
 ./es-cli.js createIndex
 ```
### Starting the server
```
export DATABASE_URL=postgres://origin:origin@localhost/origin
export ELASTICSEARCH_HOST=localhost:9200
lerna run start:discovery --scope origin-discovery --stream
```

The server should start and you can now point your browser to http://localhost:4000/graphql to access the GraphQL playground.
