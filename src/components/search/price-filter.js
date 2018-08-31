import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Range } from 'rc-slider'

import schemaMessages from '../../schemaMessages/index'

class PriceFilter extends Component {
  constructor(props){
    super(props)

    this.handlePriceChange = this.handlePriceChange.bind(this)
  }
  handlePriceChange([bottomAmount, topAmount]) {
    $('#price-amount-from').text(`${bottomAmount}$`)
    $('#price-amount-to').text(`${topAmount}$`)
    $('#price-amount-display-from').text(`${bottomAmount}$`)
    $('#price-amount-display-to').text(`${topAmount}$`)
  }

  render() {
    const min = 0
    const max = 500
    return (
      <div className="d-flex flex-column" key={this.props.filter.listingPropertyName}>
        <div className="d-flex flex-row price-filter">
          <div id="price-amount-from" className="mr-auto price-slider-amount">{min}$</div>
          <div id="price-amount-to" className="price-slider-amount">{max}$</div>
        </div>
        <Range
          min={min}
          max={max}
          defaultValue={[min, max]}
          count={2}
          pushable={(max-min)/20}
          tipFormatter={value => `${value}$`}
          onChange={this.handlePriceChange}
        />
        <div className="d-flex flex-row justify-content-between mt-4 price-filter">
          <div className="d-flex flex-row">
            <div id="price-amount-display-from" className="price-filter-amount">{min}</div>
            <div className="price-filter-currency">$/night</div>
          </div>
          <div className="price-filter-dash">-</div>
          <div className="d-flex flex-row">
            <div id="price-amount-display-to" className="price-filter-amount">{max}</div>
            <div className="price-filter-currency">$/night</div>
          </div>
        </div>
      </div>
    )
  }
}

export default injectIntl(PriceFilter)
