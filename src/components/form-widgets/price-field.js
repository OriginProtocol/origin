import React, { Component } from 'react'
import { getFiatPrice } from 'utils/priceUtils'

class PriceField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.formData || '',
      priceUsd: '0.00',
      currencyCode: props.currencyCode || 'USD'
    }

    const { options } = props
    const { selectedSchema } = options
    const enumeratedPrice = selectedSchema && selectedSchema.properties['price'].enum
    this.priceHidden =
      enumeratedPrice &&
      enumeratedPrice.length === 1 &&
      enumeratedPrice[0] === 0
  }

  async componentDidMount() {
    const { price, currencyCode } = this.state
    if (this.props.formData) {
      const priceUsd = await getFiatPrice(price, currencyCode)
      this.setState({
        priceUsd
      })
    }
  }

  onChange() {
    return async (event) => {
      const value = event.target.value
      const isNan = value === '' || isNaN(value)
      const valueNum = isNan ? value : parseFloat(value)
      if (valueNum < 0) { return }
      this.setState({
        price: valueNum
      })

      if (!isNan) {
        const priceUsd = await getFiatPrice(valueNum, this.state.currencyCode)
        this.setState({
          priceUsd
        }, () => this.props.onChange(valueNum))
      }
    }
  }

  render() {
    return(
      !this.priceHidden &&
      <div className="price-field">
        <label className="control-label" htmlFor="root_price">
          {this.props.schema.title}
          {this.props.required &&
            <span className="required">*</span>
          }
        </label>
        <div className="row">
          <div className="col-sm-6">
            <div className="price-field-container">
              <input
                type="number"
                id="root_price"
                className="price-field form-control"
                value={ this.state.price }
                onChange={ this.onChange() }
                required={ this.props.required } />
              <span className="currency-badge">
                <img src="images/eth-icon.svg" role="presentation" />
                ETH
              </span>
            </div>
          </div>
          <div className="col-sm-6 no-left-padding">
            <div className="price-field-fiat">
              { this.state.priceUsd }&nbsp;
              <span className="currency-badge text-grey">
                <img src="images/usd-icon.svg" role="presentation" />
                {this.state.currencyCode}
              </span>
            </div>
          </div>
        </div>
        <p className="help-block">
          The cost to buy this listing. Price is always in <a href="https://en.wikipedia.org/wiki/Ethereum" target="_blank" rel="noopener noreferrer">ETH</a>, <span className="text-bold">USD is an estimate.</span>
        </p>
      </div>
    )
  }
}

export default PriceField
