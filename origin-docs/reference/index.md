---
layout: page
title: Using Origin.js
nav_weight: 100
category: Origin.js
---

Origin.js is an easy-to-use libray for the Origin Protocol. 

The Origin object is the base of interaction with origin.js. Other resources are members of this object. For example, `origin.marketplace`, `origin.purchases`, `origin.attestations`, etc.

## Configuration
Configuration options are passed into the Origin constructor at instantiation.

```javascript
let configOptions = {
  option: 'value'
}
let origin = new Origin(configOptions)
```

 Valid options:

 - `ipfsDomain`
 - `ipfsApiPort`
 - `ipfsGatewayPort`
 - `ipfsGatewayProtocol`
 - `discoveryServerUrl`
 - `messagingNamespace`
 - `arbitrator`
 - `affiliate`
 - `blockEpoch`
 - `attestationServerUrl`
 - `ipfsCreator`
 - `OrbitDB`
 - `ecies`
 - `web3`
 - `contractAddresses`

 > For example, if you are running a local IPFS daemon then you could set following config options:

```javascript

const configOptions = {
  ipfsDomain: '127.0.0.1',
  ipfsApiPort: '5001',
  ipfsGatewayPort: '8080',
  ipfsGatewayProtocol: 'http'
}
const origin = new Origin(configOptions)
```