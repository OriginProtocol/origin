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
      <section className="step">
        <h4>Your listing is now on the IPFS network</h4>
        <p>
          We've uploaded your listing to our IPFS gateway. This gateway is currently 
          connected to hundreds of peers that can serve your listing.
        </p>
        <div className="btn-wrapper">
          <a href={"http://gateway.0rigin.org/ipfs/" + this.props.ipfsHash} target="_blank">
             <button className="btn btn-info">
              See your listing on IPFS
            </button>
          </a>
        </div>
        <h4>Add your listing to the blockchain</h4>
        <p>
          Next, we will submit your IPFS content address to the Ethereum blockchain. 
          The Ethereum smart contract will be responsible for allowing buyers to 
          transact with your listing. In this demo, generating the listing JSON, 
          posting the data to IPFS, and making your listing live on the Ethereum 
          blockchain are all separate steps to illustrate how everything works. 
          In practice, this would all happen as a single step.
        </p>
        <div className="btn-wrapper">
          <button className="btn btn-primary" onClick={() => {
            this.handleSubmitToBlockchain(this.props.ipfsHash, this.props.onStep3Completion)
          }}>
            Submit listing to Ethereum
          </button>
        </div>
      </section>
    );
  }
}

export default DemoStep3
