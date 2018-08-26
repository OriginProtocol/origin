import React, { Component, Fragment } from 'react'

class PriceField extends Component {
  constructor(props) {
    super(props)
    this.state = {
      price: props.formData || ''
    }

    const { options } = props
    const { selectedSchema } = options
    const enumeratedPrice = selectedSchema && selectedSchema.properties['price'].enum
    this.priceHidden =
      enumeratedPrice &&
      enumeratedPrice.length === 1 &&
      enumeratedPrice[0] === 0
  }

  onChange() {
    return (event) => {
      const value = parseFloat(event.target.value)
      this.setState({
        price: value,
        priceUsd: value * 72
      }, () => this.props.onChange(value))
    }
  }

  render() {
    return(
      this.priceHidden ?
        <div></div> :
        <Fragment>
          <label className="control-label" htmlFor="root_price">
            {this.props.schema.title}
            {this.props.required &&
              <span className="required">*</span>
            }
          </label>
          <input
            type="number"
            id="root_price"
            className="price-field form-control"
            value={ this.state.price }
            onChange={ this.onChange() }
            required={ this.props.required } />
          { this.state.priceUsd &&
            <Fragment>
              <p className="help-block">{ this.state.priceUsd }USD</p>
              <p className="help-block">
                The cost to buy this listing. Price is always in <a href="https://en.wikipedia.org/wiki/Ethereum">ETH</a>, USD is an estimate.
              </p>
            </Fragment>
          }
        </Fragment>
    )
  }
}

export default PriceField
