import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import omit from 'lodash/omit'
import { fbt } from 'fbt-runtime'
import Categories from '@origin/graphql/src/constants/Categories'

// import PriceFilter from './filters/Price'

const CategoriesEnum = require('Categories$FbtEnum')

import withConfig from 'hoc/withConfig'
import Dropdown from 'components/Dropdown'

const categories = Categories.root.map(c => ({
  id: c[0],
  type: c[0].split('.').slice(-1)[0]
}))
categories.unshift({ id: '', type: '' })

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = props.value || {}
  }

  render() {
    const enabled = get(this.props, 'config.discovery', false)
    const category = this.state.category || {}
    return (
      <div className="search-bar">
        <div className="container d-flex align-items-center">
          <div className="input-group search-query">
            <Dropdown
              className="input-group-prepend"
              content={
                <SearchDropdown
                  active={category}
                  onChange={category =>
                    this.setState({ category, open: false }, () => {
                      this.doSearch()
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
              placeholder={enabled ? 'Search' : 'Note: Search unavailable'}
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
          {/* <PriceFilter
            low={this.state.priceLow}
            high={this.state.priceHigh}
            onChange={({ low, high }) => {
              this.setState(
                { priceMin: low / 1000, priceMax: high / 1000 },
                () => this.doSearch()
              )
            }}
          /> */}
        </div>
      </div>
    )
  }

  doSearch() {
    if (this.props.onSearch) {
      this.props.onSearch(omit(this.state, 'open'))
    }
  }
}

const SearchDropdown = ({ onChange, active }) => (
  <div className="dropdown-menu show">
    {categories.map((category, idx) => (
      <a
        key={idx}
        className={`dropdown-item${
          active && active.id === category.id ? ' active' : ''
        }`}
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
    .input-group.search-query
      max-width: 520px
      .btn-outline-secondary
        border: 1px solid var(--light)
        font-size: 14px
        font-weight: normal
        color: var(--dusk)
        &:hover,&:active,&:focus
          color: var(--white)
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
