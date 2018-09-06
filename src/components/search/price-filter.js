import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'
import { Range } from 'rc-slider'
import $ from 'jquery'

import schemaMessages from '../../schemaMessages/index'

class PriceFilter extends Component {
  constructor(props){
    super(props)
    this.defaultMinimum = 0
    this.defaultMaximum = 500

    this.state = {
      value:[this.defaultMinimum, this.defaultMaximum]
    }

    this.handlePriceChange = this.handlePriceChange.bind(this)
  }
  
  handlePriceChange([bottomAmount, topAmount]) {
    $('#price-amount-from').text(`${bottomAmount}$`)
    $('#price-amount-to').text(`${topAmount}$`)
    $('#price-amount-display-from').text(`${bottomAmount}$`)
    $('#price-amount-display-to').text(`${topAmount}$`)

    this.setState({ value: [bottomAmount, topAmount] })
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  // Called by filter-group
  onClear() {
    this.setState({ value: [this.defaultMinimum, this.defaultMaximum] })
  }

  render() {
    return (
      <div className="d-flex flex-column" key={this.props.filter.listingPropertyName}>
        <div className="d-flex flex-row price-filter">
          <div id="price-amount-from" className="mr-auto price-slider-amount">{this.defaultMinimum}$</div>
          <div id="price-amount-to" className="price-slider-amount">{this.defaultMaximum}$</div>
        </div>
        <Range
          value={this.state.value}
          min={this.defaultMinimum}
          max={this.defaultMaximum}
          defaultValue={[this.defaultMinimum, this.defaultMaximum]}
          count={2}
          pushable={(this.defaultMaximum - this.defaultMinimum)/20}
          tipFormatter={value => `${value}$`}
          onChange={this.handlePriceChange}
        />
        <div className="d-flex flex-row justify-content-between mt-4 price-filter">
          <div className="d-flex flex-row">
            <div id="price-amount-display-from" className="price-filter-amount">{this.defaultMinimum}</div>
            <div className="price-filter-currency">$/night</div>
          </div>
          <div className="price-filter-dash">-</div>
          <div className="d-flex flex-row">
            <div id="price-amount-display-to" className="price-filter-amount">{this.defaultMaximum}</div>
            <div className="price-filter-currency">$/night</div>
          </div>
        </div>
      </div>
    )
  }
}

export default injectIntl(PriceFilter)
