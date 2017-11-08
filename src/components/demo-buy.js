import React, { Component } from 'react'
import { render } from 'react-dom'

import contractService from '../services/contract-service'
import ipfsService from '../services/ipfs-service'
import bs58 from 'bs58'

class DemoBuy extends Component {

  constructor(props) {
    super(props)


    this.state = {
    }

  }

  handleBuyClicked() {
    const unitsToBuy = 1;
    const totalPrice = (unitsToBuy * this.props.listing.contract.price);
    contractService.buyListing(this.props.listing.contract.index, unitsToBuy, totalPrice)
    .then((transactionReceipt) => {
      console.log("Purchased!")
      //onSubmitToBlockchain(transactionReceipt.tx)
    })
    .catch((error) => {
      console.log(error)
      alert(error)
    });
  }

  render() {
    return (
      <section className="step">
        <h3>Purchase</h3>

         <div>
          </div>

          <div className="listing">
            <hr/>
            <h3>{this.props.listing.ipfs.name}</h3>
            <img
              height="200"
              src={
                (this.props.listing.ipfs.pictures && this.props.listing.ipfs.pictures.length>0) ?
                this.props.listing.ipfs.pictures[0] :
                'http://www.lackuna.com/wp-content/themes/fearless/images/missing-image-640x360.png'
              }
            />
            <br/>
            Category:{this.props.listing.ipfs.category}<br/>
            Description:{this.props.listing.ipfs.description}<br/>
            Price:{this.props.listing.ipfs.price}<br/>
            Contract Price:{this.props.listing.contract.price}<br/>
            Units Available:{this.props.listing.contract.unitsAvailable}<br/>

        <div className="btn-wrapper">
          <button className="btn btn-primary" onClick={() => {
            console.log(this.props)
            this.handleBuyClicked()
          }}>
            Confirm Purchase
          </button>
        </div>


          </div>


      </section>
    );
  }
}

export default DemoBuy
