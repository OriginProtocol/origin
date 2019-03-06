import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getFiatPrice } from 'utils/priceUtils'
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl'

class PriceField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.formData && parseFloat(props.formData) || '',
      currencyCode: props.currencyCode || 'USD'
    }

    const { options } = props
    const { selectedSchema } = options
    const enumeratedPrice =
      selectedSchema &&
      selectedSchema.properties['price'] &&
      selectedSchema.properties['price'].enum

    this.priceHidden =
      enumeratedPrice &&
      enumeratedPrice.length === 1 &&
      enumeratedPrice[0] === 0

    this.intlMessages = defineMessages({
      'singularPrice': {
        id: 'schema.priceInEth.singular',
        defaultMessage: 'Price'
      },
      'multiUnitPrice': {
        id: 'schema.priceInEth.multiUnit',
        defaultMessage: 'Price (per unit)'
      }
    })
  }

  componentDidMount() {
    // If a price is passed in, we must call the onChange callback
    // to set the price in the parent form
    // Unfortunately, the setTimeout is needed to allow the parent
    // form to render and be ready to handle the onChange event
    const { price } = this.state
    if (price) {
      setTimeout(() => {
        this.props.onChange(price)
      })
    }
  }

  onChange() {
    return async event => {
      const value = event.target.value
      const isNan = value === '' || isNaN(value)
      const valueNum = isNan ? value : parseFloat(value)
      if (valueNum < 0) {
        return
      }
      this.setState(
        {
          price: valueNum
        },
        () => this.props.onChange(valueNum)
      )
    }
  }

  render() {
    const { price, currencyCode } = this.state
    const priceUsd = getFiatPrice(price, currencyCode, 'ETH')
    const { isMultiUnitListing } = this.props.formContext
    const fieldTitle = this.props.schema.title

    return (
      !this.priceHidden && (
        <div className="price-field">
          <label className="control-label" htmlFor="root_price">
            {
              fieldTitle === 'price' ?
                this.props.intl.formatMessage(
                  isMultiUnitListing ?
                    this.intlMessages.multiUnitPrice :
                    this.intlMessages.singularPrice
                )
                :
                fieldTitle
            }
            {this.props.required && <span className="required">*</span>}
          </label>
          <div className="row">
            <div className="col-6">
              <div className="price-field-container">
                <input
                  type="number"
                  id="root_price"
                  step="0.00001"
                  className="price-field form-control"
                  value={price}
                  onChange={this.onChange()}
                  required={this.props.required}
                />
                <span className="currency-badge">
                  <img src="images/eth-icon.svg" role="presentation" />
                  ETH
                </span>
              </div>
            </div>
            <div className="col-6 no-left-padding">
              <div className="price-field-fiat">
                {priceUsd}&nbsp;
                <span className="currency-badge text-grey">
                  <img src="images/usd-icon.svg" role="presentation" />
                  {currencyCode}
                </span>
              </div>
            </div>
          </div>
          <p className="help-block">
            <FormattedMessage
              id={'price-field.price-help-v1'}
              defaultMessage={'Listings are always priced in {currency}. '}
              values={{
                currency: (
                  <a
                    href="https://en.wikipedia.org/wiki/Ethereum"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ETH
                  </a>
                )
              }}
            />
            &nbsp;
            <span className="text-bold">
              <FormattedMessage
                id={'price-field.price-usd-disclaimer'}
                defaultMessage={'USD is an estimate.'}
              />
            </span>
          </p>
        </div>
      )
    )
  }
}

const mapStateToProps = ({ exchangeRates }) => ({
  exchangeRates
})

export default connect(mapStateToProps)(injectIntl(PriceField))
