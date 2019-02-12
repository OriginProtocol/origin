import React, { Component } from 'react'
import { withRouter } from 'react-router'
import get from 'lodash/get'
import queryString from 'query-string'
import { fbt } from 'fbt-runtime'
import Categories from 'origin-graphql/src/constants/Categories'

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
    this.state = getStateFromQuery(props)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.setState(getStateFromQuery(this.props))
    }
  }

  render() {
    const enabled = get(this.props, 'config.discovery', false)
    const category = this.state.category || {}

    return (
      <div className="search-bar">
        <div className="container">
          <div className="input-group">
            <Dropdown
              className="input-group-prepend"
              content={
                <SearchDropdown
                  onChange={category =>
                    this.setState({ category, open: false }, () => {
                      this.props.saveFilters('category', category.id)
                    })
                  }
                />
              }
              open={this.state.open}
              onClose={() => this.setState({ open: false })}
            >
              <button
                className="btn btn-outline-secondary dropdown-toggle"
                onClick={() =>
                  this.setState({ open: this.state.open ? false : true })
                }
              >
                {CategoriesEnum[category.id] ? (
                  <fbt desc="category">
                    <fbt:enum enum-range={CategoriesEnum} value={category.id} />
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
              value={this.state.searchInput}
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
`)
