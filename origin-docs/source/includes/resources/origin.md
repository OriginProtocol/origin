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
 - `attestationServerUrl`

 For example, if you are running a local IPFS daemon then you could set following config options:

```javascript
let origin = new Origin(configOptions)

{
  ipfsDomain: '127.0.0.1',
  ipfsApiPort: '5001',
  ipfsGatewayPort: '8080',
  ipfsGatewayProtocol: 'http'
}
let origin = new Origin(configOptions)
```
