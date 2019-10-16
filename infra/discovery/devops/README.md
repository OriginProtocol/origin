# es-cli.js
Helper script for doing maintenance on elastic search indexes and aliases.

## Using the es-cli.js script in production
 - Get a shell in a production pod. For ex.:
 ```
 kubectl -n dev exec -ti dev-discovery-85894c99cd-hftsc /bin/bash
 ```
 - Set the ELASTICSEARCH_HOST env. variable (double check it valie in EnvKey).
 ```
 export ELASTICSEARCH_HOST='elasticsearch-elasticsearch-svc:9200'
 ```
 - Run the es-cli.js script in interactive mode
 ```
 node esl-cli.js -i
 ```
 
 ## Index and alias structure
 The data is stored in queried against an index. We have been using the naming convention "listings_<N>", N being a number.
 We have an alias "listings" that points to the current index. Having an alias allows to do maintenance without downtime.
 For ex.:
  - Assume we want to re-index the corpus. We have an alias "listings" pointing to an existing index "listings_1".
  - We can re-index the data in a new index "listings_2"
  - Then we can atomically swap the alias to point to "listings_2".
  - Finally we can delete "listings_1"
