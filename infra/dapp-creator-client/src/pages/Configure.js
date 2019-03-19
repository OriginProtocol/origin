'use strict'

import React from 'react'

import Redirect from 'components/Redirect'
import categories from '@origin/graphql/src/constants/Categories'

class Configure extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      expandedCategories: [],
      filterByTypeEnabled: this.getCategoryFromConfig(),
      redirect: null
    }

    this.getCategoryFromConfig = this.getCategoryFromConfig.bind(this)
    this.getSubcategoryFromConfig = this.getSubcategoryFromConfig.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.isCategoryDropdownDisplayed = this.isCategoryDropdownDisplayed.bind(
      this
    )
    this.isCheckedSubcategory = this.isCheckedSubcategory.bind(this)
    this.isExpandedCategory = this.isExpandedCategory.bind(this)
    this.onCategoryCheck = this.onCategoryCheck.bind(this)
    this.onSubcategoryCheck = this.onSubcategoryCheck.bind(this)
    this.toggleFilterByOwn = this.toggleFilterByOwn.bind(this)
    this.toggleFilterByType = this.toggleFilterByType.bind(this)
    this.toggleCategory = this.toggleCategory.bind(this)
  }

  async handleSubmit() {
    this.setState({ redirect: '/metamask' })
  }

  componentDidMount() {
    // Handle the case where filter by own listings is enabled but the Ethereum
    // address is different to the currently active web3 account (which will
    // populate the config.marketplacePublisher attribute)
    if (
      this.props.config.filters.listings.marketplacePublisher &&
      this.props.config.filters.listings.marketplacePublisher !==
        web3.eth.accounts[0]
    ) {
      this.setListingFilters({
        marketplacePublisher: web3.eth.accounts[0]
      })
    }
  }

  // Retrieve the category object from the filter value in the config
  getCategoryFromConfig() {
    if (!this.props.config.filters.listings.category) return null
    return categories.root.find(category => {
      return category[0] === this.props.config.filters.listings.category
    })
  }

  // Retrieve the subCategory object from filter value in the config
  getSubcategoryFromConfig() {
    if (!this.props.config.filters.listings.subCategory) return false

    const category = this.getCategoryFromConfig()
    if (!category) {
      return false
    }

    return categories[category[0]].find(subCategory => {
      return subCategory[0] === this.props.config.filters.listings.subCategory
    })
  }

  // Determines if the category dropdown should be displayed
  isCategoryDropdownDisplayed() {
    return this.isCategoryFiltered() || this.state.filterByTypeEnabled
  }

  // Determines if there is either category or subcategory filtering applied in configs filters
  isCategoryFiltered() {
    return (
      this.props.config.filters.listings.category ||
      this.props.config.filters.listings.subCategory
    )
  }

  // Determines if a checkbox for a subcategory should be checked
  isCheckedSubcategory(category, subcategory) {
    return (
      (this.getCategoryFromConfig() === category &&
        !this.getSubcategoryFromConfig()) ||
      this.getSubcategoryFromConfig() === subcategory
    )
  }

  // Determines if a category should be expanded so that all of its subcategories are displayed
  isExpandedCategory(category) {
    return this.state.expandedCategories.includes(category)
  }

  setListingFilters(obj) {
    const newConfig = {
      ...this.props.config,
      filters: {
        ...this.props.config.filters,
        listings: {
          ...this.props.config.filters.listings,
          ...obj
        }
      }
    }
    // Propagate to parent
    this.props.onChange(newConfig)
  }

  // Handles filter updates when a category is checked
  onCategoryCheck(category) {
    if (this.getCategoryFromConfig() === category) {
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    } else {
      this.setListingFilters({
        category: category[0],
        subCategory: null
      })
    }
  }

  // Handles filter updates when a subcategory is checked
  onSubcategoryCheck(category, subcategory) {
    if (this.getSubcategoryFromConfig() === subcategory) {
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    } else {
      this.setListingFilters({
        category: category[0],
        subCategory: subcategory[0]
      })
    }
  }

  toggleCategory(event, category) {
    if (event.target.type === 'checkbox') return
    if (this.state.expandedCategories.includes(category)) {
      this.setState(prevState => {
        return {
          expandedCategories: prevState.expandedCategories.filter(
            x => x !== category
          )
        }
      })
    } else {
      this.setState(prevState => {
        return {
          expandedCategories: [...prevState.expandedCategories, category]
        }
      })
    }
  }

  toggleFilterByOwn(event) {
    this.setListingFilters({
      marketplacePublisher: event.target.checked ? web3.eth.accounts[0] : ''
    })
  }

  toggleFilterByType(event) {
    this.setState({
      filterByTypeEnabled: event.target.checked
    })
    if (!event.target.checked) {
      // Remove any listing filters for categories if the optional is disabled
      this.setListingFilters({
        category: null,
        subCategory: null
      })
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderRedirect()}

        <h1>Configure Your Marketplace</h1>
        <h4>Finish setting up your marketplace with the options below.</h4>

        <div className="form-group">
          <label>Filter Listings (optional)</label>

          <p>
            <small>
              You can choose to only show listings created on your marketplace
              or specific types of listings. Otherwise, your DApp will show
              listings from all Origin marketplaces.
            </small>
          </p>

          <div className="option">
            <input
              className="form-check-input"
              type="checkbox"
              checked={this.props.config.filters.listings.marketplacePublisher}
              onChange={this.toggleFilterByOwn}
            />
            Only use listings from my marketplace
          </div>

          <div
            className={`option category-select ${
              this.state.filterByTypeEnabled ? 'expanded' : 'collapsed'
            }`}
          >
            <input
              className="form-check-input"
              type="checkbox"
              checked={this.isCategoryDropdownDisplayed()}
              onChange={this.toggleFilterByType}
            />
            Only use listings from specific categories
          </div>

          {this.isCategoryDropdownDisplayed() && (
            <div className="category-dropdown">
              {categories.root.map((category, i) => (
                <div key={i}>
                  <div
                    className={`category ${
                      this.isExpandedCategory(category)
                        ? 'expanded'
                        : 'collapsed'
                    }`}
                    onClick={event => this.toggleCategory(event, category)}
                  >
                    <input
                      type="checkbox"
                      checked={this.getCategoryFromConfig() === category}
                      onChange={() => this.onCategoryCheck(category)}
                    />
                    {category[1]}
                  </div>
                  {this.isExpandedCategory(category) &&
                    categories[category[0]].map((subcategory, y) => (
                      <div className="subcategory" key={y}>
                        <input
                          type="checkbox"
                          checked={this.isCheckedSubcategory(
                            category,
                            subcategory
                          )}
                          onChange={() =>
                            this.onSubcategoryCheck(category, subcategory)
                          }
                        />
                        {subcategory[1]}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions clearfix">
          <button
            onClick={() => this.setState({ redirect: '/customize' })}
            className="btn btn-outline-primary btn-lg btn-left"
          >
            Back
          </button>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-right"
            onClick={this.handleSubmit}
          >
            Done
          </button>
        </div>
      </form>
    )
  }

  renderRedirect() {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .option
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    padding: 0.75rem 2rem 0.75rem 2rem
    border-radius: var(--default-radius)
    margin-bottom: 0.25rem
    position: relative

  .disabled
    color: var(--light)

  .category-dropdown
    padding: 1rem
    border: 1px solid var(--light)
    margin-top: -5px
    border-bottom-left-radius: var(--default-radius)
    border-bottom-right-radius: var(--default-radius)
    background-color: var(--pale-grey-four)

  .category-dropdown ul
    margin-bottom: 0

  .category-select.expanded
    border-bottom-left-radius: 0
    border-bottom-right-radius: 0

  .category
    position: relative
    padding-left: 1.2rem
    cursor: pointer
    margin-bottom: 0.5rem

  .category
    input
      margin-right: 0.5rem

  .category.collapsed:before
    content: ''
    width: 0
    height: 0
    border-top: 5px solid transparent
    border-bottom: 5px solid transparent
    border-left: 5px solid black
    position: absolute
    left: 0
    top: 0.5rem

  .category.expanded:before
    content: ''
    width: 0
    height: 0
    border-left: 5px solid transparent
    border-right: 5px solid transparent
    border-top: 5px solid black
    position: absolute
    left: 0
    top: 0.75rem

  .subcategory
    padding-left: 2rem

  .subcategory
    input
      margin-right: 0.5rem
`)

export default Configure
