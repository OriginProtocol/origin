import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import queryString from 'query-string'
import { fbt } from 'fbt-runtime'

import { getStateFromQuery } from './_filters'

import withConfig from 'hoc/withConfig'

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = getStateFromQuery(props)
  }

  render() {
    const enabled = get(this.props, 'config.discovery', false)
    return (
      <form
        className={this.props.className || ''}
        onSubmit={e => {
          e.preventDefault()
          this.doSearch()
        }}
      >
        <input
          className={`form-control${!this.state.searchInput ? ' empty' : ''}`}
          type="search"
          value={this.state.searchInput}
          onChange={e => this.setState({ searchInput: e.target.value })}
          onKeyUp={e => {
            if (e.keyCode === 13) this.doSearch()
          }}
          onInput={e => {
            // When 'clear' button is clicked
            if (e.target.value === '') {
              this.setState({ searchInput: '' }, () => this.doSearch())
            }
          }}
          placeholder={
            enabled
              ? this.props.placeholder
                ? 'Search'
                : null
              : fbt('Note: Search unavailable', 'search.search-unavailable')
          }
        />
      </form>
    )
  }

  doSearch() {
    const search = this.state
    this.props.history.push({
      pathname: '/search',
      search: queryString.stringify({
        q: search.searchInput || undefined,
        category: search.category.type || undefined,
        priceMin: search.priceMin || undefined,
        priceMax: search.priceMax || undefined
      })
    })
  }
}

export default withConfig(withRouter(Search))

require('react-styl')(`
  .navbar
    .form-inline
      flex: 1
      max-width: 260px
      margin-left: 1rem
      .form-control
        background: url(images/magnifying-glass.svg) no-repeat right 10px center
        border-color: #c2cbd3
        border-radius: 5px
        width: 100%
  .listings-container
    .search
      .form-control
        font-size: 22px
        border: 0
        border-bottom: 1px solid #dde6ea
        background-image: url(images/magnifying-glass.svg)
        background-repeat: no-repeat
        background-position: right 0 center
        background-size: 20px
        border-radius: 0
        padding-left: 0

        &::-webkit-input-placeholder
          color: #94a7b5
        &:focus
          box-shadow: none

`)
