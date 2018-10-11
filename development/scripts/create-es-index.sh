#!/bin/bash

echo 'Attempting to create Elasticsearch mappings'

curl -X PUT 'localhost:9200/listings' -H 'Content-Type: application/json' -d '{
  "mappings": {
    "listing": {
      "properties": {
	"price.amount":               { "type": "double" },
	"price.currency":             { "type": "text" },
	"commission.amount":          { "type": "double" },
	"commission.currency":        { "type": "text" },
	"securityDeposit.amount":     { "type": "double" },
	"securityDeposit.currency":   { "type": "text" },
	"unitsTotal":                 { "type": "integer" },
	"language":                   { "type": "keyword" },
	"listingType":                { "type": "keyword" },
	"status":                     { "type": "keyword" },
	"category":                   { "type": "keyword", "copy_to": "all_text" },
	"subCategory":                { "type": "keyword", "copy_to": "all_text" },
	"description":                { "type": "text", "copy_to": "all_text" },
	"title":                      { "type": "text", "copy_to": "all_text" },
	"all_text":                   { "type": "text" }
      }
    }
  }
}';

curl -X PUT 'localhost:9200/origin' -H 'Content-Type: application/json' -d'{}';

echo 'Index created successfully. Exiting.';
