import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import get from 'lodash/get'
import queryString from 'query-string'
import { fbt } from 'fbt-runtime'

import { getStateFromQuery, pushSearchHistory } from './_utils'

import withConfig from 'hoc/withConfig'
import withIsMobile from 'hoc/withIsMobile'

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...getStateFromQuery(props),
      active: false
    }
  }

  componentDidMount() {
    this.onOutsideClick = this.onOutsideClick.bind(this)
    document.body.addEventListener('click', this.onOutsideClick)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.onOutsideClick)
  }

  componentDidUpdate(prevProps) {
    if (this.props.location.search !== prevProps.location.search) {
      this.setState({
        ...getStateFromQuery(this.props)
      })
    }
  }

  render() {
    return this.renderContent()
  }

  renderContent() {
    const enabled = get(this.props, 'config.discovery', false)
    const { placeholder, className, isMobile } = this.props
    const { searchInput } = this.state

    return (
      <form
        className={`listing-search-wrapper${className ? ' ' + className : ''}${
          this.state.active && isMobile ? ' active' : ''
        }`}
        onSubmit={e => {
          e.preventDefault()
          this.doSearch()
        }}
        ref={ref => (this.formRef = ref)}
      >
        <div className="search-wrapper">
          <div className="search-input-wrapper">
            <div className="search-input">
              <input
                ref={ref => (this.inputRef = ref)}
                className={`form-control${!searchInput ? ' empty' : ''}`}
                type="input"
                value={searchInput}
                onChange={e => this.setState({ searchInput: e.target.value })}
                onFocus={() => this.setState({ active: true })}
                onKeyUp={e => {
                  if (e.keyCode === 13) this.doSearch()
                }}
                placeholder={
                  enabled
                    ? placeholder
                      ? fbt('Search', 'Search')
                      : null
                    : fbt(
                        'Note: Search unavailable',
                        'search.search-unavailable'
                      )
                }
                required={true}
              />
              <button
                type="button"
                className="clear-button"
                onClick={() =>
                  this.setState({ searchInput: '' }, () => this.doSearch(false))
                }
              />
            </div>
            {isMobile && this.state.active && (
              <button
                type="button"
                className="cancel-button"
                onClick={() => this.setState({ active: false })}
              />
            )}
          </div>
          {this.renderSearchDropdown()}
        </div>
      </form>
    )
  }

  renderSearchDropdown() {
    const { isMobile } = this.props

    if (!this.state.active) {
      return null
    }

    return (
      // tabIndex to keep the focus on click
      <div
        className={`search-dropdown${isMobile ? '' : ' floating'}`}
        tabIndex={isMobile ? -1 : 0}
      >
        {!isMobile && (
          <div className="title">
            <fbt desc="Search.Categories">Categories</fbt>
          </div>
        )}
        <div className="featured-categories-wrapper">
          <div className="featured-categories">
            <div
              className="category-icon rewards"
              onClick={() => this.onRewardsClick()}
            >
              <fbt desc="Search.Rewards">Rewards</fbt>
            </div>
            <div
              className="category-icon apparel"
              onClick={() =>
                this.onCategoryClick({ subCategory: 'clothingAccessories' })
              }
            >
              <fbt desc="Search.Apparel">Apparel</fbt>
            </div>
            <div
              className="category-icon gift-cards"
              onClick={() => this.onCategoryClick({ subCategory: 'giftCards' })}
            >
              <fbt desc="Search.GiftCards">Gift Cards</fbt>
            </div>
            <div
              className="category-icon housing"
              onClick={() => this.onCategoryClick({ subCategory: 'housing' })}
            >
              <fbt desc="Search.Housing">Housing</fbt>
            </div>
            <div
              className="category-icon services"
              onClick={() => this.onCategoryClick({ category: 'services' })}
            >
              <fbt desc="Search.Services">Services</fbt>
            </div>
            <div
              className="category-icon art"
              onClick={() =>
                this.onCategoryClick({ subCategory: 'artsCrafts' })
              }
            >
              <fbt desc="Search.Art">Art</fbt>
            </div>
          </div>
        </div>
      </div>
    )
  }

  onCategoryClick({ category, subCategory }) {
    const newState = {
      category: { type: category },
      subCategory: { type: subCategory }
    }
    this.setState(newState, () => this.doSearch())
  }

  onOutsideClick(e) {
    if (!this.formRef.contains(e.target)) {
      this.setState({ active: false })
    }
  }

  onRewardsClick() {
    this.props.history.push({
      pathname: '/search',
      search: queryString.stringify({ ognListings: true })
    })
    this.setState({ active: false, searchInput: '' })
    this.inputRef.blur()
  }

  doSearch(shouldClose = true) {
    const search = this.state
    pushSearchHistory(this.props.history, search)
    if (shouldClose) {
      this.setState({ active: false })
      this.inputRef.blur()
    }
  }
}

export default withIsMobile(withConfig(withRouter(Search)))

require('react-styl')(`
  .listing-search-wrapper
    .search-wrapper
      position: relative
      width: 100%
      .search-input-wrapper
        display: flex
        width: 100%
        .search-input
          flex: 1;
          position: relative
          .clear-button
            display: none
            position: absolute
            right: 0.25rem
            top: 1px
            bottom: 1px
            width: 2rem
            background-color: white
            background-image: url('images/nav/close-icon.svg')
            background-repeat: no-repeat
            background-position: center
            border: 0
            background-size: 1.25rem
          .form-control
            border-radius: 5px
            flex: 1
            padding-right: 2.375rem
            &:valid + .clear-button
              display: inline-block

      .cancel-button
        flex: 2rem 0 0
        height: auto
        background-color: white
        display: inline-block
        background-image: url('images/close-icon.svg')
        background-repeat: no-repeat
        background-position: center right
        border: 0
        background-size: 1rem

      .search-dropdown
        background-color: var(--white)
        padding: 1.5rem 2rem
        &.floating
          z-index: 1000
          position: absolute
          left: 0
          border-radius: 5px
          box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1)
          border: solid 1px #c2cbd3
        .title
          font-size: 12px
          color: var(--dusk)
          margin-bottom: 0.5rem
          text-transform: uppercase
          margin-bottom: 1rem

        .featured-categories-wrapper
          margin: 0 -2rem
          overflow-x: scroll

        .featured-categories
          display: inline-flex
          padding: 0 2rem
          .category-icon
            width: 60px
            flex: auto 0 0
            margin-right: 20px
            text-align: center
            color: var(--dark)
            font-size: 0.6rem
            text-overflow: ellipsis
            cursor: pointer

            &.rewards
              &:before
                background-color: #007fff
            &:before
              content: ''
              display: inline-block
              width: 60px
              height: 60px
              background-color: #f0f6f9
              border-radius: 50%
              background-repeat: no-repeat
              background-position: center

            &.apparel:before
              background-image: url('images/categories/apparel-icon.svg')
            &.rewards:before
              background-image: url('images/origin-icon-white.svg')
              background-size: 30px 34px
            &.gift-cards:before
              background-image: url('images/categories/gift-card-icon.svg')
            &.housing:before
              background-image: url('images/categories/housing-icon.svg')
            &.services:before
              background-image: url('images/categories/services-icon.svg')
            &.art:before
              background-image: url('images/categories/art-icon.svg')

            &:last-of-type
              margin-right: 0

    &:focus-within
      .form-control
        box-shadow: none
        outline: none
      .search-wrapper .search-dropdown.floating
        &:focus
          box-shadow: none
          outline: none

    &.active
      position: fixed
      top: 0
      bottom: 0
      right: 0
      left: 0
      padding: 0.5rem 1rem
      background-color: white
      z-index: 1000
      .search-wrapper
        .search-dropdown
          padding: 1.5rem 0

  .navbar
    .listing-search-wrapper
      max-width: 350px
      flex: 1
      margin-left: 1rem
      .form-control
        background: url(images/magnifying-glass.svg) no-repeat right 10px center
        border-color: #c2cbd3
        width: 100%

  @media (max-width: 767.98px)
    .listing-search-wrapper
      padding: 0 1rem
      .search-wrapper .search-input-wrapper .search-input .form-control
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
