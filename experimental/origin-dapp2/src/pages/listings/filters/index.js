import React, { Component } from 'react'
import get from 'lodash/get'

import PriceFilter from 'pages/listings/filters/PriceFilter'
import MultipleSelectionFilter from 'pages/listings/filters/MultipleSelectionFilter'

export default class FilterGroup extends Component {
  render() {
    return get(this.props, 'filterSchema.items', []).map(filterGroup =>
      filterGroup.items.map((filter, index) => {
        if (filter.type === 'price') {
          return (
            <PriceFilter
              filterGroup={filterGroup}
              key={index}
              maxPrice={this.props.maxPrice}
              minPrice={this.props.minPrice}
            />
          )
        }
        if (filter.type === 'multipleSelectionFilter') {
          return (
            <MultipleSelectionFilter
              filter={filter}
              category={this.props.category}
              title={'Title'}
              key={index}
            />
          )
        }
      })
    )
  }
}
