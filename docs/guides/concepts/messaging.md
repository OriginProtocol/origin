---
layout: page
title: Messaging
nav_weight: 1
category: "Concepts"
---

Origin messaging provides end to end encrypted communication between two users, using ethereum addresses as their identity.

A room is everything exchanged between two users. Each room uses its own derived keys. This allows a user to give an arbitrator access to only the conversations between themselves and their counterparty, without having to open up other conversations.

At a data level, a room is a list of both the messages from either party and the public keys used between them.

Currently Origin Messaging hosts a service to exchange encrypted room messages, however more distributed message exchanges are possible.