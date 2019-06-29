#!/bin/bash

rm -rf node_modules/websocket/.git
rm -rf node_modules/react-native-push-notification/.git
rm -rf node_modules/react-native-safe-area-view/.git
npx install-local -S ../packages/contracts \
	../packages/eventsource \
	../packages/event-cache \
	../packages/graphql \
	../packages/ipfs \
	../packages/messaging-client \
	../packages/services \
	../packages/validator \
	../packages/mobile-bridge \
	../packages/web3-provider
