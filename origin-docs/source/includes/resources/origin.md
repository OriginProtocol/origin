# Origin Object

The Origin object is the base of interaction with origin.js. Other resources are members of this object. For example, `origin.listings`, `origin.purchases`, `origin.attestations`, etc.

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
  ipfsGatewayProtocol: 'http',
  discoveryServerUrl: 'example.com/discovery',
  attestationServerUrl: 'example.com/attestations',
  blockEpoch: '0',
  arbitrator: 'Ox000000000000000000000',
  affiliate: '0x00000000000000000000'
  contractAddresses: {},
  OrbitDB: () => {},
  web3: Web3,
  messagingNamespace: 'staging',
  ipfsCreator: () => {},
  ecies: { encrypt: () => {}), decrypt: () => {}}
}
const origin = new Origin(configOptions)
```
