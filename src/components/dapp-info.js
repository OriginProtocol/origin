import React from 'react'
import origin from '../services/origin'

const DappInfo = () => {
  return (
    <div className="dapp-info-wrapper">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h1>DApp Info</h1>
            <h3 className="lead">Developer information about this build</h3>
            <table border="1" width="100%">
              <tr><th colSpan="2">origin.js</th></tr>
              <tr><td>Version</td><td>{ origin.version }</td></tr>
              <tr><th colSpan="2">Environment Variables</th></tr>
              <tr><td>BRIDGE_SERVER_DOMAIN</td><td>{ process.env.BRIDGE_SERVER_DOMAIN }</td></tr>
              <tr><td>BRIDGE_SERVER_PROTOCOL</td><td>{ process.env.BRIDGE_SERVER_PROTOCOL }</td></tr>
              <tr><td>DISCOVERY_SERVER_URL</td><td>{ process.env.DISCOVERY_SERVER_URL }</td></tr>
              <tr><td>IPFS_DOMAIN</td><td>{ process.env.IPFS_DOMAIN }</td></tr>
              <tr><td>IPFS_GATEWAY_PORT</td><td>{ process.env.IPFS_GATEWAY_PORT }</td></tr>
              <tr><td>IPFS_GATEWAY_PROTOCOL</td><td>{ process.env.IPFS_GATEWAY_PROTOCOL }</td></tr>
              <tr><td>IPFS_API_PORT</td><td>{ process.env.IPFS_API_PORT }</td></tr>
              <tr><td>IPFS_SWARM</td><td>{ process.env.IPFS_SWARM }</td></tr>
              <tr><td>ARBITRATOR_ACCOUNT</td><td>{ process.env.ARBITRATOR_ACCOUNT }</td></tr>
              <tr><td>MESSAGING_ACCOUNT</td><td>{ process.env.MESSAGING_ACCOUNT }</td></tr>
              <tr><td>PROVIDER_URL</td><td>{ process.env.PROVIDER_URL }</td></tr>
              <tr><td>MESSAGING_NAMESPACE</td><td>{ process.env.MESSAGING_NAMESPACE }</td></tr>
              <tr><td>DEPLOY_TAG</td><td>{ process.env.DEPLOY_TAG }</td></tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DappInfo
