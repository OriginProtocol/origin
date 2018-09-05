import React, { Component } from 'react'
import { injectIntl, FormattedMessage } from 'react-intl'

import MultipleSelectionFilter from 'components/search/multiple-selection-filter'
import PriceFilter from 'components/search/price-filter'
import CounterFilter from 'components/search/counter-filter'
import DateFilter from 'components/search/date-filter'

class FilterGroup extends Component {
  constructor(props) {
    super(props)

    /* Because of a workaround in `react-dates` module we need to message the DateFilter
     * when it gets shown - when dropdown containing date filter is opened
     */
    this.dateFilters = []
  }

  resolveFromListingSchema(path) {
    var properties = Array.isArray(path) ? path : path.split('.')
    return properties.reduce((prev, curr) => prev && prev[curr], this.props.listingSchema)
  }

  renderFilter(filter, title) {
    if (filter.type == 'multipleSelectionFilter') {
      return(
        <MultipleSelectionFilter
          filter={filter}
          multipleSelectionValues={this.resolveFromListingSchema(filter.listingPropertyName)}
          listingType={this.props.listingType}
          title={title}
        />
      )
    } else if (filter.type == 'price') {
      return (
        <PriceFilter
          filter={filter}
        />
      )
    } else if (filter.type == 'counter') {
      return(
        <CounterFilter
          filter={filter}
        />
      )
    } else if (filter.type == 'date') {
      return(
        <DateFilter
          filter={filter}
          onChildMounted={child => {
            this.dateFilters.push(child)
          }}
          onChildUnMounted={child => {
            const index = this.dateFilters.indexOf(child)
            if (index !== -1)
              this.dateFilters.splice(index, 1)
          }}
        />
      )
    } else {
      throw `Unrecognised filter type "${filter.type}".`
    }
  }

  render() {
    const title = this.props.intl.formatMessage(this.props.filterGroup.title)
    const formId = `filter-group-${title}`
    const containsDateFilter = this.props.filterGroup.items.some(filter => filter.type == 'date')

    return (
      <li className="nav-item" key={this.props.index}>
        <a onClick={() => {
            if (!containsDateFilter)
              return

            this.dateFilters.forEach(dateFilter => dateFilter.onOpen())
          }}
          className="nav-link"
          data-toggle="dropdown"
          data-parent="#search-filters-bar"
        >
          {this.props.intl.formatMessage(this.props.filterGroup.title)}
        </a>
        <form className="dropdown-menu" id={formId}>
          <div className="d-flex flex-column">
            <div className="dropdown-form">
            {this.props.filterGroup.items.map(filter => this.renderFilter(filter, title))}
            </div>
            <div className="d-flex flex-row button-container">
              <a className="dropdown-button dropdown-button-left align-middle">
                <FormattedMessage
                  id={'SearchResults.filterGroup.searchFiltersClear'}
                  defaultMessage={'Clear'}
                />
              </a>
              <a className="dropdown-button dropdown-button-right align-middle align-self-center">
                <FormattedMessage
                  id={'SearchResults.filterGroup.searchFiltersApply'}
                  defaultMessage={'Apply'}
                />
              </a>
            </div>
          </div>
        </form>
      </li>
    )
  }
}

export default injectIntl(FilterGroup)
