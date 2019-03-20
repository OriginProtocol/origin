#!/bin/bash

rm -rf node_modules/websocket/.git
npx install-local -S ../packages/contracts ../packages/origin-js
