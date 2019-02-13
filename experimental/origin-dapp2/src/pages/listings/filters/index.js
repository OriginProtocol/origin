import React, { Component } from 'react'
import get from 'lodash/get'

import PriceFilter from 'pages/listings/filters/PriceFilter'
import MultipleSelectionFilter from 'pages/listings/filters/MultipleSelectionFilter'

export default class FilterGroup extends Component {
  constructor(props) {
    super(props)

    this.childFilters = []
    this.addChildFilter = this.addChildFilter.bind(this)
    this.removeChildFilter = this.removeChildFilter.bind(this)
    this.applyFilters = this.applyFilters.bind(this)
    this.clearFilters = this.clearFilters.bind(this)
    this.handleOpenDropdown = this.handleOpenDropdown.bind(this)

    this.state = { open: false }
  }

  async clearFilters(event) {
    event.preventDefault()
    event.persist()
    this.setState({ open: false })

    this.childFilters.forEach(childFilter =>
      childFilter.onClear(() => this.props.saveFilters())
    )
  }

  async applyFilters(event) {
    event.preventDefault()
    this.setState({ open: false })

    Promise.all(
      this.childFilters.map(childFilter => childFilter.getFilters())
    ).then(values => {
      const filters = values[0][0]
      this.props.saveFilters(filters)
    })
  }

  addChildFilter(filter) {
    this.childFilters.push(filter)
  }

  removeChildFilter(filter) {
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
      <li className="search-filters nav-item">
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
                      onChildMounted={this.addChildFilter}
                      onChildUnMounted={this.removeChildFilter}
                    />
                  )
                }
                if (filter.type === 'multipleSelectionFilter') {
                  return (
                    <MultipleSelectionFilter
                      key={index}
                      filter={filter}
                      category={this.props.category}
                      title={formTitle}
                      onChildMounted={this.addChildFilter}
                      onChildUnMounted={this.removeChildFilter}
                    />
                  )
                }
              })}
            </div>
            <div className="d-flex flex-row button-container">
              <a
                onClick={this.clearFilters}
                className="dropdown-button dropdown-button-left align-middle"
              >
                Clear
              </a>
              <a
                onClick={this.applyFilters}
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

require('react-styl')(`
  .search-filters .rc-slider-rail
    height: 15px
    border-radius: 10px
    background-color: var(--light)
    margin-left: -5px
    margin-right: -5px
    width: 104%

  .search-filters .rc-slider-handle
    margin-top: auto
    border: 1px solid var(--steel)
    width: 15px
    height: 15px

  .search-filters .rc-slider-track
    height: 15px
    border-radius: 0px
    background-color: var(--steel)
  
  .search-filters .dropdown-menu
    left: auto
    padding: 0px
    margin: auto
    margin-top: 0.125rem
    border: 0px
    background-color: transparent
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5)
    border-radius: 0.25rem

  .search-filters .dropdown-menu .dropdown-form
    padding: 1rem 1.5rem
    background-color: var(--pale-grey-three)
    border-top-right-radius: 0.25rem
    border-top-left-radius: 0.25rem
    min-width: 260px

  .search-filters .dropdown-form label,
  .search-filters .dropdown-form .label
    font-size: 1.2rem
    font-weight: normal
    color: black

  .search-filters .dropdown-form .form-check-input
      margin-top: 0.4rem
      margin-left: -1.4rem

  .search-filters .two-column-container
      width: 660px

  .search-filters .three-column-container
      width: 990px

  .search-filters .limit-checkbox-two-columns
      width: 50%

  .search-filters .limit-checkbox-three-columns
    width: 33%

  .search-filters .price-filter
    margin-left: -0.4rem
    margin-right: -0.4rem
    padding-bottom: 0.5rem
    min-width: 300px

  .search-filters .price-filter-amount
    font-weight: normal
    font-size: 1.1rem
    width: 70px
    height: 40px
    border: 1px solid rgba(0, 0, 0, 0.15)
    border-top-left-radius: 0.25rem
    border-bottom-left-radius: 0.25rem
    text-align: center
    line-height: 2.5rem

  .search-filters .price-filter-dash
    text-align: center
    line-height: 2.5rem

  .search-filters .price-filter-currency
    font-weight: normal
    font-size: 0.875rem
    color: var(--dusk)
    width: 65px
    height: 40px
    border-bottom: 1px solid rgba(0, 0, 0, 0.15)
    border-top: 1px solid rgba(0, 0, 0, 0.15)
    border-right: 1px solid rgba(0, 0, 0, 0.15)
    border-top-right-radius: 0.25rem
    border-bottom-right-radius: 0.25rem
    background-color: var(--pale-grey-two)
    text-align: center
    line-height: 2.5rem
    white-space: nowrap

  .search-filters .price-slider-amount
    font-size: 0.875rem
    color: #000f
    font-weight: normal

  .search-filters .dropdown-form input[type="checkbox"]
    transform: scale(1.2)

  .search-filters a.dropdown-button
    width: 100%
    background-color: var(--pale-grey-two);
    text-align: center
    color: var(--clear-blue)
    border-bottom-right-radius: 0.25rem
    border-bottom-left-radius: 0.25rem
    line-height: 50px
    font-weight: normal
    font-size: 1.1rem
    cursor: pointer

  .search-filters a.dropdown-button:hover
    background-color: var(--pale-grey-two-darker)
    color: var(--clear-blue)

  .search-filters a.dropdown-button-left
    width: 50%
    border-top: 1px solid rgba(0, 0, 0, 0.15)
    border-bottom-right-radius: 0px
    border-right: 1px solid rgba(0, 0, 0, 0.15)

  .search-filters a.dropdown-button-right
    width: 50%
    border-top: 1px solid rgba(0, 0, 0, 0.15)
    border-bottom-left-radius: 0px

  .search-filters .rc-slider-rail
    height: 15px
    border-radius: 10px
    background-color: var(--light)
    margin-left: -5px
    margin-right: -5px
    width: 104%

  .search-filters .rc-slider-handle
    margin-top: auto
    border: 1px solid var(--steel)
    width: 15px
    height: 15px

  .search-filters .rc-slider-track
    height: 15px
    border-radius: 0px
    background-color: var(--steel)

  .search-filters .date-readonly-input
    color: var(--bluey-grey)
    font-size: 1rem
    background-color: var(--pale-grey-four)
    border: solid 1px var(--light)
    border-radius: 5px
    max-width: 130px
    padding: 0.6rem 0.7rem

  .search-filters .CalendarMonth_caption,
  .search-filters .CalendarDay__default
    color: var(--dark)
    font-weight: normal

  .search-filters .DayPickerNavigation_button__horizontalDefault
    border-radius: 5px

  .search-filters .DayPicker_transitionContainer
    border-radius: 5px
    border: 1px solid --var(--light)

  .search-filters .CalendarDay__selected,
  .search-filters .CalendarDay__selected:active,
  .search-filters .CalendarDay__selected:hover
    background-color: var(--dusk)
    border: 1px solid var(--dusk)

  .CalendarDay__selected_span:active,
  .CalendarDay__selected_span:hover
    border-color: var(--light-dusk)

  .search-filters .CalendarDay__hovered_span,
  .search-filters .CalendarDay__hovered_span:hover
    border: 1px solid var(--dusk)
    background-color: var(--light-dusk)

  .search-filters .CalendarDay__selected_span
    background-color: var(--light-dusk)
    border: 1px solid var(--dusk)
`)
