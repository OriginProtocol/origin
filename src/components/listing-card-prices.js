import React, { Component } from 'react'

const cc = require('cryptocompare')

const targetCurrencyCode = 'ETH';

class ListingCardPrices extends Component {

  constructor(props) {
    super(props)
    this.state = {
      price: "Loading...",
      exchangeRate: null,
      approxPrice: "Loading...",
      currencyCode: "USD",
      defaultDecimalPlaces: 5
    }
  }

  componentWillReceiveProps(nextProps){
    const p = nextProps.price;
    this.setState({
      price: p,
      defaultDecimalPlaces: this.getPrecision(p)
    });
  }

  getPrecision(n) {
    const asString = n.toString();
    const scientificMatch = asString.match(/e-(\d+)/);
    if(scientificMatch && scientificMatch.length > 0) {
      return scientificMatch[1];
    } else {
      return asString.indexOf('.') + 1;
    }
  }

  componentDidMount() {
    try {
      this.retrieveConversion()
    } catch (error) {
      console.error(error)
    }
  }

  retrieveConversion(currencyCode){
    const desiredCurrencyCode = currencyCode ? currencyCode : this.state.currencyCode
    const instance = this;
    return new Promise((resolve, reject) => {
      cc.price(targetCurrencyCode, [desiredCurrencyCode]).then(prices => {
        resolve(this.setState({ exchangeRate: prices[desiredCurrencyCode] }));
      }).catch(console.error)
    });
  }

  formatApproxPrice(){
    return Number(this.state.price * this.state.exchangeRate).toLocaleString(undefined, {minimumFractionDigits: this.state.defaultDecimalPlaces});
  }

  render() {
    return (
      <div>
        <p className="price placehold">
          {this.state.price && `${Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: this.state.defaultDecimalPlaces})} ETH`}
          {this.state.unitsAvailable===0 &&
            <span className="sold-banner">Sold</span>
          }
        </p>
        <p className="approxPrice">(~{this.formatApproxPrice()} {this.state.currencyCode})</p>
      </div>
    )
  }
}

export default ListingCardPrices
