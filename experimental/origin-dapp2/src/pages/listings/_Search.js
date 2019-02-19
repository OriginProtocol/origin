import React, { Component } from 'react'
import { withRouter } from 'react-router'
import get from 'lodash/get'
import find from 'lodash/find'
import isNil from 'lodash/isNil'

import isEmpty from 'lodash/isEmpty'
import queryString from 'query-string'
import { fbt } from 'fbt-runtime'
import Categories from 'origin-graphql/src/constants/Categories'
import FilterGroup from 'pages/listings/filters/index'

const CategoriesEnum = require('Categories$FbtEnum')

import withConfig from 'hoc/withConfig'
import Dropdown from 'components/Dropdown'

const categories = Categories.root.map(c => ({
  id: c[0],
  type: c[0].split('.').slice(-1)[0]
}))
categories.unshift({ id: '', type: '' })

function getStateFromQuery(props) {
  const getParams = queryString.parse(props.location.search)
  return {
    category: categories.find(c => c.type === getParams.type) || {},
    searchInput: getParams.q || '',
    open: false
  }
}

class Search extends Component {
  constructor(props) {
    super(props)

    this.filterByDropDown = this.filterByDropDown.bind(this)
    this.toggleDropDown = this.toggleDropDown.bind(this)

    this.state = {
      ...getStateFromQuery(props),
      maxPrice: 10000,
      minPrice: 0
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location.search !== this.props.location.search) {
      this.setState(getStateFromQuery(this.props))
    }

    const stateCategory = get(this.state, 'category.type', 'all')
    const category = isEmpty(stateCategory) ? 'all' : stateCategory
    const prevCategoryType = get(prevState, 'category.type', '')
    if (category !== prevCategoryType) {
      const filterSchemaPath = `schemas/searchFilters/${category}-search.json`

      fetch(filterSchemaPath)
        .then(response => response.json())
        .then(schemaJson => {
          if (category === schemaJson.listingType)
            this.setState({ filterSchema: schemaJson })
        })
        .catch(function(e) {
          console.error(`Error reading schema ${filterSchemaPath}: ${e}`)
          throw e
        })
    }
  }

  filterByDropDown(category) {
    this.setState({ category, open: false, yes: true }, () => {
      const name = 'category'
      const value = category.id
      if (value) {
        this.props.saveFilters([
          { name, value, operator: 'EQUALS', valueType: 'STRING' }
        ])
      } else {
        this.props.saveFilters()
      }
    })
  }

  toggleDropDown(title) {
    return () => {
      if (this.state.open[title]) {
        this.setState({ open: { [title]: false } })
      } else {
        this.setState({ open: { [title]: true } })
      }
    }
  }

  render() {
    const { category = {}, searchInput, minPrice, maxPrice, open } = this.state
    const enabled = get(this.props, 'config.discovery', false)
    const filterSchemaItems = get(this.state, 'filterSchema.items', [])
    return (
      <>
        <div className="search-bar">
          <div className="container">
            <div className="input-group">
              <Dropdown
                className="input-group-prepend"
                content={<SearchDropdown onChange={this.filterByDropDown} />}
                open={open['Category Dropdown']}
                onClose={this.toggleDropDown('Category Dropdown')}
              >
                <button
                  className="btn btn-outline-secondary dropdown-toggle"
                  onClick={this.toggleDropDown('Category Dropdown')}
                >
                  {CategoriesEnum[category.id] ? (
                    <fbt desc="category">
                      <fbt:enum
                        enum-range={CategoriesEnum}
                        value={category.id}
                      />
                    </fbt>
                  ) : (
                    fbt('All', 'listingType.all')
                  )}
                </button>
              </Dropdown>
              <input
                type="text"
                className="form-control"
                placeholder={enabled ? null : 'Note: Search unavailable'}
                value={searchInput}
                onChange={e => this.setState({ searchInput: e.target.value })}
                onKeyUp={e => {
                  if (e.keyCode === 13) this.doSearch()
                }}
              />
              <div className="input-group-append">
                <button
                  className="btn btn-primary"
                  onClick={() => this.doSearch()}
                />
              </div>
            </div>
          </div>
        </div>
        <nav
          id="search-filters-bar"
          className="navbar filter-group navbar-expand-sm"
        >
          <div className="container d-flex flex-row">
            <ul
              className={
                filterSchemaItems.length
                  ? 'navbar-nav collapse navbar-collapse'
                  : ''
              }
            >
              {filterSchemaItems.map((filterGroup, key) => {
                const filterTitle = get(filterGroup, 'title.defaultMessage', '')

                return (
                  <FilterGroup
                    key={filterTitle + key}
                    filterGroup={filterGroup}
                    minPrice={minPrice}
                    maxPrice={maxPrice}
                    category={category}
                    saveFilters={this.props.saveFilters}
                    onClose={this.toggleDropDown(filterTitle)}
                    open={this.state.open[filterTitle]}
                  />
                )
              })}
            </ul>
          </div>
        </nav>
      </>
    )
  }

  doSearch() {
    this.props.history.replace({
      to: '/search',
      search: queryString.stringify({
        q: this.state.searchInput || undefined,
        type: this.state.category.type || undefined
      })
    })

    if (this.props.onSearch) {
      this.props.onSearch(this.state.searchInput)
    }
  }
}

const SearchDropdown = ({ onChange }) => (
  <div className="dropdown-menu show">
    {categories.map((category, idx) => (
      <a
        key={idx}
        className="dropdown-item"
        href="#"
        onClick={e => {
          e.preventDefault()
          onChange(category)
        }}
      >
        {CategoriesEnum[category.id] ? (
          <fbt desc="category">
            <fbt:enum enum-range={CategoriesEnum} value={category.id} />
          </fbt>
        ) : (
          fbt('All', 'listingType.all')
        )}
      </a>
    ))}
  </div>
)

export default withConfig(withRouter(Search))

require('react-styl')(`
  .search-bar
    padding: 0.7rem 0
    box-shadow: 0 1px 0 0 var(--light)
    background-color: var(--pale-grey)
    .input-group
      max-width: 520px
    .btn-outline-secondary
      border: 1px solid var(--light)
      font-size: 14px
      font-weight: normal
      color: var(--dusk)
    .dropdown-toggle::after
      margin-left: 0.5rem
    .form-control
      border-color: var(--light)
      &::placeholder
        opacity: 0.5
    .btn-primary
      background: var(--dusk) url(images/magnifying-glass.svg) no-repeat center
      border-color: var(--dusk)
      padding-left: 1.25rem
      padding-right: 1.25rem

  .navbar
    &.filter-group
      background-color: var(--white) !important
      ul
        padding-top: 4px

      .container .navbar-nav
        border-bottom: 1px solid var(--light)

      .navbar-nav .nav-item > a
        font-size: 0.875rem
        color: var(--dark)
        padding: 0.09rem 0.40rem
        margin: 0.12rem 0.30rem
        font-weight: normal
        white-space: nowrap
        overflow: hidden
        border-radius: 4px

      .navbar-nav .nav-item > a:hover
        background-color: var(--pale-grey-three)
        cursor: pointer

      .navbar-nav .nav-item.show > a
        border: 0.06rem solid var(--dusk)
        padding: 0.03rem 0.34rem

`)
