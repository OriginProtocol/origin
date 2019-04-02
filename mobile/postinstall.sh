#!/bin/bash

rm -rf node_modules/websocket/.git
npx install-local -S ../packages/contracts \
	../packages/eventsource \
	../packages/origin-js \
	../packages/graphql \
	../packages/ipfs \
	../packages/linker-client \
	../packages/messaging-client \
	../packages/services \
	../packages/validator \
	../packages/mobile-bridge
