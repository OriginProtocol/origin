import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getFiatPrice } from 'utils/priceUtils'

class ListingCardPrices extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.price,
      approxPrice: 'Loading...',
      fiatCurrencyCode: 'USD',
      cryptoCurrencyCode: 'ETH',
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

  render() {
    const { price, fiatCurrencyCode, cryptoCurrencyCode } = this.state
    const fiatPrice = getFiatPrice(
      price,
      fiatCurrencyCode,
      cryptoCurrencyCode
    )

    return (
      <div>
        <div className="d-flex align-items-center price-container">
          <Fragment>
            <div className="d-inline-block price placehold">
              {fiatPrice === null && (
                <FormattedMessage
                  id={'listing-card-prices.loadingMessage'}
                  defaultMessage={'Loading...'}
                />
              )}
              <div className="d-flex">
                <img
                  src="images/eth-icon.svg"
                  role="presentation"
                  className="eth-icon"
                />
                <div className="values">
                  <div className="eth">
                    {`${Number(this.state.price).toLocaleString(undefined, {
                      minimumFractionDigits: 5,
                      maximumFractionDigits: 5
                    })}`}
                      &nbsp;ETH
                  </div>
                  <div className="fiat">
                    {fiatPrice === null && 'Loading'}
                    {fiatPrice}
                    {fiatPrice && ` ${fiatCurrencyCode}`}
                  </div>
                </div>
              </div>
            </div>
          </Fragment>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ exchangeRates }) => ({
  exchangeRates
})

export default connect(
  mapStateToProps
)(ListingCardPrices)
