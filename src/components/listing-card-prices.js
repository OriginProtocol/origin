import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

const baseCurrencyCode = 'ETH'

class ListingCardPrices extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.price,
      exchangeRate: null,
      approxPrice: 'Loading...',
      currencyCode: 'USD',
      defaultDecimalPlaces: this.getPrecision(props.price),
      exchangeBaseURL: 'https://api.cryptonator.com/api/ticker/'
    }
  }

  getPrecision(n) {
    const asString = n.toString()
    const scientificMatch = asString.match(/e-(\d+)/)

    if (scientificMatch && scientificMatch.length > 0) {
      return scientificMatch[1]
    } else {
      return asString.indexOf('.') + 1
    }
  }

  componentDidMount() {
    try {
      this.retrieveConversion()
    } catch (error) {
      console.error(error)
    }
  }

  doFetch() {
    let exchangeURL = this.state.exchangeBaseURL
    exchangeURL += baseCurrencyCode.toLowerCase()
    exchangeURL += '-'
    exchangeURL += this.state.currencyCode.toLowerCase()

    return new Promise((resolve) => {
      fetch(exchangeURL)
        .then(res => res.json())
        .then(json => {
          const exchangeRateFromAPI = json.ticker.price
          if (typeof Storage !== 'undefined') {
            const object = { value: exchangeRateFromAPI, timestamp: new Date() }
            localStorage.setItem('origin.exchangeRate', JSON.stringify(object))
          }
          resolve(this.setState({ exchangeRate: exchangeRateFromAPI }))
        })
        .catch(console.error)
    })
  }

  retrieveConversion() {
    if (typeof Storage !== 'undefined') {
      const cachedRate = localStorage.getItem('origin.exchangeRate')
      if (cachedRate) {
        const HALF_HOUR = 30 * 60 * 1000
        const cachedTime = new Date(JSON.parse(cachedRate).timestamp)
        if (new Date() - cachedTime < HALF_HOUR) {
          this.setState({ exchangeRate: JSON.parse(cachedRate).value })
        } else {
          localStorage.removeItem('origin.exchangeRate')
          this.doFetch() // cache is invalid
        }
      } else {
        this.doFetch() // isn't cached to begin with
      }
    } else {
      this.doFetch() // localStorage not available
    }
  }

  formatApproxPrice() {
    return Number(this.state.price * this.state.exchangeRate).toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )
  }

  render() {
    return (
      <div>
        <div className="d-flex align-items-center price-container">
          <div>
            <div className="d-inline-block price placehold">
              {this.state.exchangeRate == null && (
                <FormattedMessage
                  id={'listing-card-prices.loadingMessage'}
                  defaultMessage={'Loading...'}
                />
              )}
              {this.state.exchangeRate != null &&
                this.formatApproxPrice() + ' ' + this.state.currencyCode}
              <span className="alternate-price text-muted">
                &nbsp;|{' '}
                {`${Number(this.state.price).toLocaleString(undefined, {
                  minimumFractionDigits: 5,
                  maximumFractionDigits: 9
                })}`}&nbsp;
                <FormattedMessage
                  id={'listing-card-prices.ethereumCurrencyAbbrev'}
                  defaultMessage={'ETH'}
                />
              </span>
            </div>
            {this.props.unitsAvailable === 0 && (
              <span className="sold-banner">
                <FormattedMessage
                  id={'listing-card-prices.sold'}
                  defaultMessage={'Sold'}
                />
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default ListingCardPrices
