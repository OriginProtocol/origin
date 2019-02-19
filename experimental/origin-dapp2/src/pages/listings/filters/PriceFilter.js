import React, { Component } from 'react'
import { Range } from 'rc-slider'
import get from 'lodash/get'

import withExchangeRate from 'hoc/withExchangeRate'

import {
  FILTER_OPERATOR_GREATER_OR_EQUAL,
  FILTER_OPERATOR_LESSER_OR_EQUAL,
  VALUE_TYPE_FLOAT
} from 'constants/Search'

class PriceFilter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: [
        Math.floor(parseFloat(props.minPrice)),
        Math.ceil(parseFloat(props.maxPrice))
      ]
    }

    this.updatePriceRange = this.updatePriceRange.bind(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  componentDidUpdate(previousProps) {
    const newMaxPrice = previousProps.maxPrice !== this.props.maxPrice
    const newMinPrice = previousProps.minPrice !== this.props.minPrice

    if (newMaxPrice || newMinPrice) this.onClear()
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  onClear(callback) {
    this.setState(
      {
        value: [
          Math.floor(parseFloat(this.props.minPrice)),
          Math.ceil(parseFloat(this.props.maxPrice))
        ]
      },
      callback
    )
  }

  getFilters() {
    return [
      {
        name: this.props.filter.searchParameterName,
        value: this.state.value[0] / this.props.exchangeRate,
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_GREATER_OR_EQUAL
      },
      {
        name: this.props.filter.searchParameterName,
        value: this.state.value[1] / this.props.exchangeRate,
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_LESSER_OR_EQUAL
      }
    ]
  }

  updatePriceRange([bottomAmount, topAmount]) {
    this.setState({ value: [bottomAmount, topAmount] })
  }

  render() {
    const priceUnit = get(this.props, 'filter.priceUnit.defaultMessage', 'USD')
    const minPrice = Math.floor(parseFloat(this.props.minPrice))
    const maxPrice = Math.ceil(parseFloat(this.props.maxPrice))
    const propertyName = get(this.props, 'filter.listingPropertyName')

    return (
      <div className="d-flex flex-column" key={propertyName}>
        <div className="d-flex flex-row price-filter">
          <div id="price-amount-from" className="mr-auto price-slider-amount">
            &#36;{Number(this.state.value[0]).toLocaleString()}
          </div>
          <div id="price-amount-to" className="price-slider-amount">
            &#36;{Number(this.state.value[1]).toLocaleString()}
          </div>
        </div>
        <Range
          value={this.state.value}
          min={minPrice}
          max={maxPrice}
          defaultValue={[minPrice, maxPrice]}
          count={2}
          pushable={(maxPrice - minPrice) / 20}
          tipFormatter={value => `${value}$`}
          onChange={this.updatePriceRange}
        />
        <div className="d-flex flex-row justify-content-between mt-4 price-filter">
          <div className="d-flex flex-row">
            <div id="price-amount-display-from" className="price-filter-amount">
              {Number(this.state.value[0]).toLocaleString()}
            </div>
            <div className="price-filter-currency">{priceUnit}</div>
          </div>
          <div className="price-filter-dash">-</div>
          <div className="d-flex flex-row">
            <div id="price-amount-display-to" className="price-filter-amount">
              {Number(this.state.value[1]).toLocaleString()}
            </div>
            <div className="price-filter-currency">{priceUnit}</div>
          </div>
        </div>
      </div>
    )
  }
}

export default withExchangeRate(PriceFilter)
