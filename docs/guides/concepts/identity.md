---
layout: page
title: Identity
nav_weight: 1
category: "Concepts"
---

A user's profile is what they say about themselves, and can include signed attestations by other parties.

These profile and attestations fields are combined into one JSON document, which is posted to IPFS. That IPFS hash of this document is then passed as a parameter to the Origin IdentityEvents contract so that everyone can know that user's latest profile information.

Identitiy in Origin is tied to an Ethereum wallet address.
