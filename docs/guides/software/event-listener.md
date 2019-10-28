---
layout: page
title: Event Listener
nav_weight: 130
category: Software
---

The Origin event listener follows the blockchain, finding origin events as they happen and passes those events on to whatever systems need this data. These events are annotated with the full information about the origin resources (listings/offers) related to the event.

The data from the listener can be used to build and keep up-to-date an offline index of all Origin Protocol data on the chain. The listener has built in support for updating an Elasticsearch and a Postgres database with the current state of listings, offers, and profiles.

The listener does at-least-once notifiations. Make sure your webhooks used with the listener are idempotent, and can handle receiving the same data multiple times!

More details in the [Listener README](https://github.com/OriginProtocol/origin/tree/master/infra/discovery/src/listener).