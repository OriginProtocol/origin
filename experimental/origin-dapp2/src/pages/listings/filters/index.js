import React, { Component } from 'react'
import get from 'lodash/get'

import PriceFilter from 'pages/listings/filters/PriceFilter'
import MultipleSelectionFilter from 'pages/listings/filters/MultipleSelectionFilter'

export default class FilterGroup extends Component {
  constructor(props) {
    super(props)

    this.childFilters = []
    this.handleFilterMounted = this.handleFilterMounted.bind(this)
    this.handleFilterUnMounted = this.handleFilterUnMounted.bind(this)
    // this.handleApplyClick = this.handleApplyClick.bind(this)
    // this.handleClearClick = this.handleClearClick.bind(this)
    this.handleOpenDropdown = this.handleOpenDropdown.bind(this)

    this.state = { open: false }
  }

  handleFilterMounted(filter) {
    this.childFilters.push(filter)
  }

  handleFilterUnMounted(filter) {
    const index = this.childFilters.indexOf(filter)
    if (index !== -1) this.childFilters.splice(index, 1)
  }

  handleOpenDropdown() {
    if (this.state.open) {
      this.setState({ open: false })
      return
    } else {
      this.setState({ open: true })
    }
    const containsDateFilter = this.props.filterGroup.items.some(
      filter => filter.type === 'date'
    )
    if (!containsDateFilter) return

    /* Because of a workaround in `react-dates` module we need to message the DateFilter
     * when it gets shown - when dropdown containing date filter is opened
     */
    this.childFilters
      .filter(filter => filter.props.filter.type === 'date')
      .forEach(dateFilter => dateFilter.onOpen())
  }

  render() {
    const formTitle = get(
      this.props,
      'filterGroup.title.defaultMessage',
      'Title'
    )
    return (
      <li className="nav-item">
        <a
          onClick={this.handleOpenDropdown}
          className="nav-link"
          data-parent="#search-filters-bar"
        >
          {formTitle}
        </a>
        <form
          className={`dropdown-menu${this.state.open ? ' show' : ''}`}
          id={formTitle}
        >
          <div className="d-flex flex-column">
            <div className="dropdown-form">
              {this.props.filterGroup.items.map((filter, index) => {
                if (filter.type === 'price') {
                  return (
                    <PriceFilter
                      key={index}
                      filter={filter}
                      maxPrice={this.props.maxPrice}
                      minPrice={this.props.minPrice}
                      onChildMounted={this.handleFilterMounted}
                      onChildUnMounted={this.handleFilterUnMounted}
                    />
                  )
                }
                if (filter.type === 'multipleSelectionFilter') {
                  return (
                    <MultipleSelectionFilter
                      key={index}
                      filter={filter}
                      category={this.props.category}
                      title={'Title'}
                      onChildMounted={this.handleFilterMounted}
                      onChildUnMounted={this.handleFilterUnMounted}
                    />
                  )
                }
              })}
            </div>
            <div className="d-flex flex-row button-container">
              <a
                onClick={this.handleClearClick}
                className="dropdown-button dropdown-button-left align-middle"
              >
                Clear
              </a>
              <a
                onClick={this.handleApplyClick}
                className="dropdown-button dropdown-button-right align-middle align-self-center"
              >
                Apply
              </a>
            </div>
          </div>
        </form>
      </li>
    )
  }
}
