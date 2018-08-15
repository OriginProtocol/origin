This directory contains code for indexing servers:
 - listener: Server that listens to events emitted by Origin contracts and indexes them.
 - apollo: GraphQL server for indexed data
 - lib: library for indexing data in various backend. Currently Postgres and Elasticsearch are supported.

To start the listener:
======================

Use origin-box to start an origin-js container.

    docker-compose up origin-js
    
If you want to index data in Postgres:

    docker-compose up postgres  # start the postgres container.

    # create the postgres DB schema:
    docker exec -ti -w /app/daemon/indexing origin-js node node_modules/db-migrate/bin/db-migrate -e origin-box-genesis db:create indexing
    docker exec -ti -w /app/daemon/indexing origin-js node node_modules/db-migrate/bin/db-migrate up

If you want to index data in Elasticsearch, start the elasticsearch container.

    docker-compose up elasticsearch

Start the listener in the the origin-js container. Use --elasticsearch and/or --db options to pick the indexer(s).

    docker exec -ti origin-js node daemon/indexing/listener/listener.js --elasticsearch --db

You should see messages in the console indicating events are being indexed.


To start the Apollo GraphQL server:
===================================

You will need to update the origin-box:docker-compose.yml. For the image origin-js, proxy port 4000 to 4000 for the Apollo server. [TODO: update origin-box config]

Use origin-box to start an origin-js container.

    docker-compose up origin-js

Start the Apollo server in the origin-js container

    docker exec -ti origin-js node daemon/indexing/apollo/index.js

 The server should start and you can point your browser to http://localhost:4000 to access the GraphQL playground.


