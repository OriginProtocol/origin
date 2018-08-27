import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { getConversionRate } from 'utils/priceUtils'

class ListingCardPrices extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.price,
      exchangeRate: null,
      approxPrice: 'Loading...',
      currencyCode: 'USD',
      defaultDecimalPlaces: this.getPrecision(props.price)
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

  async componentDidMount() {
    try {
      const exchangeRate = await getConversionRate(this.state.currencyCode)
      this.setState({ exchangeRate })
    } catch (error) {
      console.error(error)
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
                  maximumFractionDigits: 5
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
