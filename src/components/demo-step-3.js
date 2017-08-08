import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'

class DemoStep3 extends Component {
  handleSubmitToBlockchain(data, onSubmitToBlockchain) {
    contractService.submitListing(data)
    .then((transactionReceipt) => {
      onSubmitToBlockchain(transactionReceipt.tx)
    });
  }

  render() {
    return (
      <div className="step">
        <h2 className="step-title">Step 3</h2>
        <p className="step-content">
          Step 3 content goes here
        </p>
        <p>
          {this.props.ipfsHash}
        </p>
        <a href={"http://gateway.0rigin.org/ipfs/" + this.props.ipfsHash} target="_blank">
          Click here to see your ipfs object
        </a>
        <p>
          Here we will submit the ipfsHash to the Ethereum blockchain. In practice this would all happen immediately.
        </p>
        <button className="btn btn-primary" onClick={() => {
          this.handleSubmitToBlockchain(this.props.ipfsHash, this.props.onStep3Completion)
        }}>
          Submit to Ethereum
        </button>
      </div>
    );
  }
}

export default DemoStep3;
