import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { Range } from 'rc-slider'
import { connect } from 'react-redux'

import {
  VALUE_TYPE_FLOAT,
  FILTER_OPERATOR_GREATER_OR_EQUAL,
  FILTER_OPERATOR_LESSER_OR_EQUAL
} from 'components/search/constants'
import { getCryptoPrice } from 'utils/priceUtils'

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

  handlePriceChange([bottomAmount, topAmount]) {
    this.setState({ value: [bottomAmount, topAmount] })
  }

  componentWillUnmount() {
    this.props.onChildUnMounted(this)
  }

  componentDidMount() {
    this.props.onChildMounted(this)
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

  componentDidUpdate(previousProps) {
    // New max price property... reset filter
    if (previousProps.maxPrice !== this.props.maxPrice) this.onClear()
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

  render() {
    const priceUnit = this.props.filter.priceUnit
      ? this.props.intl.formatMessage(this.props.filter.priceUnit)
      : `USD`
    const minPrice = Math.floor(parseFloat(this.props.minPrice))
    const maxPrice = Math.ceil(parseFloat(this.props.maxPrice))
    
    return (
      <div
        className="d-flex flex-column"
        key={this.props.filter.listingPropertyName}
      >
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

const mapStateToProps = state => ({
  filters: state.search.filters,
  exchangeRates: state.exchangeRates
})

const mapDispatchToProps = () => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PriceFilter))
