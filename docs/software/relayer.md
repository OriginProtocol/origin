---
layout: page
title: Relayer
nav_weight: 80
category: Software
---

To drive adoption, we want to be able to pay for a user's gas for certain transactions. This capability is not built into Ethereum, but can be done via contract magic. We create a proxy contract for a user and turn over ownership of that proxy to the user. The user can then sign a transaction to this proxy, which we can  submit and pay for. The proxy contract will authenicate the transaction that the user wants to run, then run it on their behalf.

The Origin Relayer validates these proxy transactions, and then submits them to the blockchain.

Two blog posts contain information about the relayer architecture.

- [Meta transaction overview](https://medium.com/originprotocol/driving-user-adoption-with-meta-transactions-3539aa6c5ae3)
- [More about the architecture](https://medium.com/originprotocol/supporting-volume-with-meta-transactions-7fcd0e8bf443)