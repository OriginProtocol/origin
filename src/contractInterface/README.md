# Ethereum Interface

The contractInterface directory contains logic and provides an interface for interacting with Ethereum smart contracts. This includes handling of multiple contract versions over time and maintaining backwards compatibility.

## Resolvers

Resolvers provide the interface to a particular contract, bringing all the adapters for the different contract versions together.

## Adapters

An adapter is an interface for a particular contract version. All adapters for a contract should surface the same interface (input and output format), internally handling the implementation details for a specific contract version.
