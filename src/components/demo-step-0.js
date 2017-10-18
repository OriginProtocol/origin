import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import bs58 from 'bs58'

class DemoStep0 extends Component {

  constructor(props) {
    super(props)

    this.state = {
      listingsResults: [],
      contractListingsCount: -1
    }

    let that = this

    // Test getting listings from chain
    setTimeout(function() {
      // TODO (Stan): Remove hacky 2s delay and correctly determine when
      // contractService is ready
      contractService.getAllListings().then((allContractResults) => {
        let resultIndex;
        console.log("Got this many results:" + allContractResults.length)
        console.log(allContractResults)
        that.setState({contractListingsCount: allContractResults.length})
        allContractResults.forEach(function(contractResult) {
          const hashStr = contractResult.ipfsHash
          ipfsService.getListing(hashStr)
          .then((listingJson) => {
            const listingData = {
              'contract': contractResult,
              'ipfs': JSON.parse(listingJson).data
            }
            console.log(listingData)
            // Append our new result to state. For now we don't care about
            // ordering.
            that.setState({
              listingsResults: that.state.listingsResults.concat(listingData)
            })
          })
          .catch((error) => {
            alert(error)
          });
        })

      }).catch((error) => {
        alert('Error:  ' + error)
      });
    }, 2000);
  }

  render() {
    return (
      <section className="step">
        <h3>Browse 0rigin Listings</h3>

        <div className="btn-wrapper">
          <button className="btn btn-primary" onClick={() => {
            this.props.onCreateListing()
          }}>
            Create Listing
          </button>
        </div>

         <div class='row'>
            <img
              src='ajax-loader.gif'
              style={{
                display: ((this.state.listingsResults.length == 0 && this.state.listingsResults.contractListingsCount != 0) ||
                  this.state.listingsResults.contractListingsCount < 0) ?
                'block' : 'none'
              }}
            />
            {(this.state.contractListingsCount == 0) ? "No listings" : ""}
            {this.state.listingsResults.map(listing => (
              <div className="col-xs-12 col-md-6 listing" key={listing.contract.ipfsHash}>
                <img
                  src={
                    (listing.ipfs.pictures && listing.ipfs.pictures.length>0) ?
                    listing.ipfs.pictures[0] :
                    'missing-image-placeholder.png'
                  }
                />
                <h2>{listing.ipfs.name}</h2>
                {listing.ipfs.description}<br/>
                <b>{listing.ipfs.price} 0rigin token</b><br/>
                <small>
                <a href={'http://ipfs.io/ipfs/'+listing.contract.ipfsHash}>IPFS</a>
                </small>
              </div>
            ))}
          </div>

      </section>
    );
  }
}

export default DemoStep0
