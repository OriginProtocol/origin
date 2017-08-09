import React, { Component } from 'react'
import { render } from 'react-dom'

import ipfsService from '../services/ipfs-service'

class DemoStep2 extends Component {
  handleSubmitToIpfs(data, onSubmitToIpfs) {
    ipfsService.submitListing(data)
    .then((ipfsHash) => {
      onSubmitToIpfs(ipfsHash)
    });
  }

  render() {
    return (
      <div className="step">
        <h2 className="step-title">Step 2</h2>
        <p className="step-content">
          Now we are ready to submit to ipfs.
        </p>
        <p>
          Why we chose IPFS blahblahblah.
        </p>
        <p>
          Do we re-render the JSON? Kind of a bitch.
        </p>
        <button className="btn btn-primary" onClick={() => {
          this.handleSubmitToIpfs(this.props.listingJson, this.props.onStep2Completion)
        }}>
          Submit to ipfs
        </button>
      </div>
    );
  }
}

export default DemoStep2;
