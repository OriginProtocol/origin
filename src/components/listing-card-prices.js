import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { getFiatPrice } from 'utils/priceUtils'

class ListingCardPrices extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.price,
      fiatPrice: null,
      approxPrice: 'Loading...',
      currencyCode: 'USD',
      defaultDecimalPlaces: this.getPrecision(props.price)
    }
  }

  async componentDidMount() {
    const { price, currencyCode } = this.state
    const fiatPrice = await getFiatPrice(price, currencyCode)
    this.setState({ fiatPrice })
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
    const { currencyCode, fiatPrice } = this.state

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
                    })}`}&nbsp;
                    <FormattedMessage
                      id={'listing-card-prices.ethereumCurrencyAbbrev'}
                      defaultMessage={'ETH'}
                    />
                  </div>
                  <div className="fiat">
                    {fiatPrice === null && 'Loading'}
                    {fiatPrice}
                    {fiatPrice && ` ${currencyCode}`}
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

export default ListingCardPrices
