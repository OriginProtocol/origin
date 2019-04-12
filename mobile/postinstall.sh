#!/bin/bash

rm -rf node_modules/websocket/.git
npx install-local -S ../packages/contracts \
	../packages/eventsource \
	../packages/graphql \
	../packages/ipfs \
	../packages/messaging-client \
	../packages/services \
	../packages/validator \
	../packages/mobile-bridge
