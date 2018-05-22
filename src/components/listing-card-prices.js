import React, { Component } from 'react'

const baseCurrencyCode = 'ETH';

class ListingCardPrices extends Component {

  constructor(props) {
    super(props)
    this.state = {
      price: props.price,
      exchangeRate: null,
      approxPrice: "Loading...",
      currencyCode: "USD",
      defaultDecimalPlaces: this.getPrecision(props.price),
      exchangeBaseURL: 'https://api.cryptonator.com/api/ticker/'
    }
  }

  getPrecision(n) {
    let asString = n.toString();
    let scientificMatch = asString.match(/e-(\d+)/);
    if (scientificMatch && scientificMatch.length > 0) {
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
    return Number(this.state.price * this.state.exchangeRate).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  render() {
    return (
      <div>
        <div className="d-flex align-items-center price-container">
          <div>
            <div className="d-inline-block price placehold">
              {this.state.exchangeRate == null && "Loading..." }
              {this.state.exchangeRate != null && this.formatApproxPrice() + " " + this.state.currencyCode }
              <span className="alternate-price text-muted"> | {`${Number(this.state.price).toLocaleString(undefined, {minimumFractionDigits: 5, maximumFractionDigits: 9})}`} ETH</span>
            </div>
            {this.props.unitsAvailable === 0 &&
              <span className="sold-banner">Sold</span>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ListingCardPrices
