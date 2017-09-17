import React, { Component } from 'react'
import { render } from 'react-dom'

import ipfsService from '../services/ipfs-service'

class DemoStep2 extends Component {
  handleSubmitToIpfs(listingData, onSubmitToIpfs) {
    ipfsService.submitListing(listingData)
    .then((ipfsHash) => {
      onSubmitToIpfs(ipfsHash)
    })
    .catch((error) => {
      alert(error)
    });
  }

  render() {
    return (
      <section className="step">
        <h4>Post your listing to the decentralized web</h4>
        <p>
          When creating your listing, we store your data as JSON.
        </p>
        <p>
          Cryptographically sign your listing using <a href='http://www.keybase.io'>KeyBase</a> to verify your identity on services like Facebook and Twitter with publicly auditable proofs.
        </p>
        <pre>{JSON.stringify(this.props.listingJson, null, 2)}</pre>
        <p>
          In traditional commerce, this JSON would be sent to
          a centralized business like Craigslist, Airbnb, or eBay. The data
          would then be stored in their databases.
        </p>
        <p>
          Because we want to build decentralized, trustless commerce, we need to
          store your data in a distributed data store that isn't owned by anyone.
        </p>
        <p>
          Enter the much-heralded IPFS (Interplanetary File System). We post your
          data to hundreds of distributed nodes on the IPFS network. This ensures
          that your listing is always available, and more importantly, is not subject
          to the whims and arbitrary policies of any centralized business or government.
        </p>
        <div className="btn-wrapper">
          <button className="btn btn-primary" onClick={() => {
            this.handleSubmitToIpfs(this.props.listingJson, this.props.onStep2Completion)
          }}>
            Submit to IPFS
          </button>
        </div>
      </section>
    );
  }
}

export default DemoStep2
