import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { getFiatPrice } from 'utils/priceUtils'

class ListingCardPrices extends Component {
  constructor(props) {
    super(props)
    this.state = {
      approxPrice: 'Loading...',
      fiatCurrencyCode: 'USD',
      cryptoCurrencyCode: 'ETH',
      defaultDecimalPlaces: this.getPrecision(props.price)
    }

    this.intlMessages = defineMessages({
      each: {
        id: 'listing-card-prices.multiUnitListing.each',
        defaultMessage: 'each'
      },
      averagePrice: {
        id: 'listing-card-prices.multiUnitListing.averagePrice',
        defaultMessage: 'average price'
      }
    })
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
    const { fiatCurrencyCode, cryptoCurrencyCode } = this.state
    const {
      price,
      isMultiUnit,
      isFractional
    } = this.props

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
                  <div>
                    <span className="eth">
                      {`${Number(price).toLocaleString(undefined, {
                        minimumFractionDigits: 5,
                        maximumFractionDigits: 5
                      })}`}
                        &nbsp;ETH
                    </span>
                    {isMultiUnit && (<span className="append">
                      &nbsp;{this.props.intl.formatMessage(this.intlMessages.each)}
                    </span>)}
                    {isFractional && (<span className="append">
                      &nbsp;{this.props.intl.formatMessage(this.intlMessages.averagePrice)}
                    </span>)}
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
)(injectIntl(ListingCardPrices))
