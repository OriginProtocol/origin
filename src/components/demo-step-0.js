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
      listingsReturned: 'hello'
    }

    let that = this

    // Test getting listings from chain
    setTimeout(function() {

      contractService.getAllListings().then((allResults) => {
        console.log("step 0 all results:" + allResults)
        var resultIndex;
        for (resultIndex in allResults) {
          const hashStr = allResults[resultIndex][2]
          const currentResultIndex = allResults[resultIndex][0].toNumber()
          ipfsService.getListing(hashStr)
          .then((listingJson) => {
            // console.log(allResults + 'ha')
            console.log("Yay! Got listing:" + listingJson)
            // let resultIndex = allResults[resultIndex[0]]
            // console.log('hi - ' + allResults[resultIndex[0]])
            console.log('int'+resultIndex[0])
            let i = allResults[resultIndex[0]]
            console.log(i)
            // that.state.listingsResults.push(listingJson)
            that.setState({ listingsResults: that.state.listingsResults.concat(JSON.parse(listingJson)) })
            console.log(that.state.listingsResults.length)
          })
          .catch((error) => {
            alert(error)
          });
        }

      }).catch((error) => {
        alert('Error:  ' + error)
      });
    }, 2000);

  }

  render() {
    return (
      <section className="step">
        <h3>Browse 0rigin Listings</h3>

         <div>
            {this.state.listingsResults.map(result => (
              <div className="result">
                <h3>{result.data.name}</h3>
                <img height="200" src={(result.data.pictures && result.data.pictures.length>0) ? result.data.pictures[0] : 'http://www.lackuna.com/wp-content/themes/fearless/images/missing-image-640x360.png'}/><br/>
                Category:{result.data.category}<br/>
                Description:{result.data.description}<br/>
                Price:{result.data.price}<br/>
                <hr/>
              </div>
            ))}
          </div>

      </section>
    );
  }
}

export default DemoStep0
