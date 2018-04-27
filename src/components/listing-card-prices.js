import React, { Component } from 'react'

const baseCurrencyCode = 'ETH';

class ListingCardPrices extends Component {

  constructor(props) {
    super(props)
    this.state = {
      price: "Loading...",
      exchangeRate: null,
      approxPrice: "Loading...",
      currencyCode: "USD",
      defaultDecimalPlaces: 5,
      exchangeBaseURL: 'https://api.cryptonator.com/api/ticker/'
    }
  }

  componentWillReceiveProps(nextProps){
    let p = nextProps.price;
    this.setState({
      price: p,
      defaultDecimalPlaces: this.getPrecision(p)
    });
  }

  getPrecision(n) {
    let asString = n.toString();
    let scientificMatch = asString.match(/e-(\d+)/);
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
    let targetCurrencyCode = currencyCode ? currencyCode : this.state.currencyCode
    let exchangeURL = this.state.exchangeBaseURL;
    exchangeURL += baseCurrencyCode.toLowerCase();
    exchangeURL += "-";
    exchangeURL += this.state.currencyCode.toLowerCase();

    return new Promise((resolve, reject) => {
      fetch(exchangeURL).then(res => res.json()).then(json => {
        resolve(this.setState({ exchangeRate: json.ticker.price }));
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
