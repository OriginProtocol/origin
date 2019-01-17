---
layout: page
title: Discovery Server
nav_weight: 100
category: Software
---

The Origin discovery server provides fast access to Origin data using [GraphQL](https://graphql.org/). This allows dapps and other applications to show Origin data quickly.

Unified [GraphQL](https://graphql.org/) API provides easy access to Listing, Offer and User objects that are stored either in `PostgreSQL` or `elasticsearch`. Api supports simple queries by property (e.g. ID) and when querying listings more advanced searches by `searchQuery` and `searchFilters`. 

## Running Locally

```bash
docker-compose up origin-discovery
```

The server should start and you can point your browser to **http://localhost:4000** to access the GraphQL playground.
