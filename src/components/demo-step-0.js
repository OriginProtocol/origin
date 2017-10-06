import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import bs58 from 'bs58'

class DemoStep0 extends Component {

  componentDidMount() {

    // Test getting listings from chain
    // setTimeout(function(){
    //   contractService.getAllListings().then((count) => {
    //     alert(count)
    //   }).catch((error) => {
    //       alert('Error:  ' + error)
    //   });
    // }, 2000);

    // Test getting listing details from IPFS
    // const testHashShortHex = "0x8098284c83b734d4b832e4a63dec86975c9bb188f63cdb308708371ea4e24520"
    const testHashShortHex = "0x18c5e2d366e08360dced047e3133758c52b1e14c1148252b75a9fa83eb8b6f2e"
    // Add our default ipfs values for first 2 bytes:  function:0x12=sha2, size:0x20=256 bits
    const testHashHex = "12" + "20" + testHashShortHex.slice(2)
    const testHashBytes = Buffer.from(testHashHex, 'hex');
    const testHashStr = bs58.encode(testHashBytes)
    ipfsService.getListing(testHashStr)
    .then((listingJson) => {
      console.log("Yay! Got listing:" + listingJson)
    })
    .catch((error) => {
      alert(error)
    });

  }

  render() {
    return (
      <section className="step">
        <h3>Browse 0rigin Listings</h3>
        <p>
          Look for things like housing, auto, and services.
        </p>

      </section>
    );
  }
}

export default DemoStep0
