import React, { Component } from 'react'
import { Range } from 'rc-slider'
import get from 'lodash/get'
import { getCryptoPrice } from 'utils/priceUtils'

export const FILTER_OPERATOR_EQUALS = 'EQUALS'
export const FILTER_OPERATOR_CONTAINS = 'CONTAINS' //for array values where at least one must match E.g. list of categories
export const FILTER_OPERATOR_GREATER = 'GREATER'
export const FILTER_OPERATOR_GREATER_OR_EQUAL = 'GREATER_OR_EQUAL'
export const FILTER_OPERATOR_LESSER = 'LESSER'
export const FILTER_OPERATOR_LESSER_OR_EQUAL = 'LESSER_OR_EQUAL'

export const VALUE_TYPE_STRING = 'STRING'
export const VALUE_TYPE_FLOAT = 'FLOAT'
export const VALUE_TYPE_DATE = 'DATE'
export const VALUE_TYPE_ARRAY_STRING = 'ARRAY_STRING'

class PriceFilter extends Component {
  constructor(props) {
    super(props)

    this.state = {
      value: [
        Math.floor(parseFloat(props.minPrice)),
        Math.ceil(parseFloat(props.maxPrice))
      ]
    }

    this.handlePriceChange = this.handlePriceChange.bind(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
  }

  componentDidUpdate(previousProps) {
    // New max price property... reset filter
    if (previousProps.maxPrice !== this.props.maxPrice) this.onClear()
  }
  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  // Called by filter-group
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

  // Called by filter-group
  async getFilters() {
    return [
      {
        name: this.props.filter.searchParameterName,
        value: await getCryptoPrice(this.state.value[0], 'USD', 'ETH'),
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_GREATER_OR_EQUAL
      },
      {
        name: this.props.filter.searchParameterName,
        value: await getCryptoPrice(this.state.value[1], 'USD', 'ETH'),
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_LESSER_OR_EQUAL
      }
    ]
  }

  handlePriceChange([bottomAmount, topAmount]) {
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
          onChange={this.handlePriceChange}
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

export default PriceFilter
