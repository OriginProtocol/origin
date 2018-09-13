import React, { Component } from 'react'
import { injectIntl } from 'react-intl'
import { Range } from 'rc-slider'
import { connect } from 'react-redux'

import {
  VALUE_TYPE_FLOAT,
  FILTER_OPERATOR_GREATER_OR_EQUAL,
  FILTER_OPERATOR_LESSER_OR_EQUAL
} from 'components/search/constants'
import { getEthPrice } from 'utils/priceUtils'

class PriceFilter extends Component {
  constructor(props) {
    super(props)
    this.defaultMinimum = 0
    this.defaultMaximum = 10000

    this.state = {
      value: [this.defaultMinimum, this.defaultMaximum]
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
        value: await getEthPrice(this.state.value[0], 'USD', 'ETH'),
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_GREATER_OR_EQUAL
      },
      {
        name: this.props.filter.searchParameterName,
        value: await getEthPrice(this.state.value[1], 'USD', 'ETH'),
        valueType: VALUE_TYPE_FLOAT,
        operator: FILTER_OPERATOR_LESSER_OR_EQUAL
      }
    ]
  }

  componentDidUpdate(previousProps) {
    // When new search is triggered, search filters get reset, so component should reset their state
    if (
      Object.keys(previousProps.filters).length !== 0 &&
      Object.keys(this.props.filters).length === 0
    )
      this.onClear()
  }

  // Called by filter-group
  onClear() {
    this.handlePriceChange([this.defaultMinimum, this.defaultMaximum])
  }

  render() {
    const priceUnit = this.props.filter.priceUnit ?
      this.props.intl.formatMessage(this.props.filter.priceUnit) :
      `USD`

    return (
      <div
        className="d-flex flex-column"
        key={this.props.filter.listingPropertyName}
      >
        <div className="d-flex flex-row price-filter">
          <div id="price-amount-from" className="mr-auto price-slider-amount">
            {this.state.value[0]}&#36;
          </div>
          <div id="price-amount-to" className="price-slider-amount">
            {this.state.value[1]}&#36;
          </div>
        </div>
        <Range
          value={this.state.value}
          min={this.defaultMinimum}
          max={this.defaultMaximum}
          defaultValue={[this.defaultMinimum, this.defaultMaximum]}
          count={2}
          pushable={(this.defaultMaximum - this.defaultMinimum) / 20}
          tipFormatter={value => `${value}$`}
          onChange={this.handlePriceChange}
        />
        <div className="d-flex flex-row justify-content-between mt-4 price-filter">
          <div className="d-flex flex-row">
            <div id="price-amount-display-from" className="price-filter-amount">
              {this.state.value[0]}
            </div>
            <div className="price-filter-currency">{priceUnit}</div>
          </div>
          <div className="price-filter-dash">-</div>
          <div className="d-flex flex-row">
            <div id="price-amount-display-to" className="price-filter-amount">
              {this.state.value[1]}
            </div>
            <div className="price-filter-currency">{priceUnit}</div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  filters: state.search.filters
})

const mapDispatchToProps = () => ({})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PriceFilter))
