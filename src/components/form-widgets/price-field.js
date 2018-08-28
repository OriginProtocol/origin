import React, { Component, Fragment } from 'react'
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
      const value = parseFloat(event.target.value)
      this.setState({
        price: value
      })
      const priceUsd = await getFiatPrice(value, this.state.currencyCode)
      this.setState({
        priceUsd
      }, () => this.props.onChange(value))
    }
  }

  render() {
    return(
      !this.priceHidden &&
      <Fragment>
        <label className="control-label" htmlFor="root_price">
          {this.props.schema.title}
          {this.props.required &&
            <span className="required">*</span>
          }
        </label>
        <div className="price-field-container">
          <input
            type="number"
            id="root_price"
            className="price-field form-control"
            value={ this.state.price }
            onChange={ this.onChange() }
            required={ this.props.required } />
          <span>
            <img src="images/eth-icon.svg" role="presentation" />
            ETH
          </span>
        </div>
        <p className="help-block">{ this.state.priceUsd }{this.state.currencyCode}</p>
        <p className="help-block">
          The cost to buy this listing. Price is always in <a href="https://en.wikipedia.org/wiki/Ethereum" target="_blank" rel="noopener noreferrer">ETH</a>, USD is an estimate.
        </p>
      </Fragment>
    )
  }
}

export default PriceField
