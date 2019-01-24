'use strict'

import React from 'react'

import Redirect from 'components/Redirect'
import listingSchemaMetadata from 'origin-dapp/src/utils/listingSchemaMetadata'

class Configure extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      config: props.config,
      expandedCategories: [],
      filterByTypeEnabled: false,
      listingTypes: listingSchemaMetadata.listingTypes,
      listingSchemasByCategory: listingSchemaMetadata.listingSchemasByCategory,
      redirect: null
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.isCheckedCategory = this.isCheckedCategory.bind(this)
    this.isExpandedCategory = this.isExpandedCategory.bind(this)
    this.toggleFilterByOwn = this.toggleFilterByOwn.bind(this)
    this.toggleFilterByType = this.toggleFilterByType.bind(this)
    this.toggleCategory = this.toggleCategory.bind(this)
  }

  toggleFilterByOwn (event) {
    const newConfig = {
      ...this.state.config,
      filters: {
        ...this.state.config.filters,
        listings: {
          ...this.state.config.filters.listings,
          marketplacePublisher: event.target.checked ? web3.eth.accounts[0] : null
        }
      }
    }

    this.setState({ config: newConfig })
    this.props.onChange(newConfig)
  }

  toggleFilterByType (event) {
    this.setState({
      filterByTypeEnabled: event.target.checked
    })
  }

  toggleCategory (type) {
    if (this.state.expandedCategories.includes(type)) {
      this.setState((prevState) => {
        return { expandedCategories: prevState.expandedCategories.filter((x) => x !== type) }
      })
    } else {
      this.setState((prevState) => {
        return { expandedCategories: [...prevState.expandedCategories, type] }
      })
    }
  }

  isCheckedCategory () {
    return true
  }

  isExpandedCategory(type) {
    return this.state.expandedCategories.includes(type)
  }

  onCategoryCheck() {
  }

  onSubCategoryClick() {
  }

  async handleSubmit () {
    this.setState({
      redirect: '/metamask'
    })
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderRedirect()}

        <h1>Configure your Marketplace</h1>
        <h4>Finish setting up your marketplace with the options below.</h4>

        <div className="form-group">
          <label>Filtering</label>

          <div className="option">
            Limit to only my own
            <input className="form-check-input"
              type="checkbox"
              onClick={this.toggleFilterByOwn} />
          </div>

          <div className={`option category-select ${this.state.filterByTypeEnabled ? 'expanded' : 'collapsed' }`}>
            Only use listings from specific categories
            <input className="form-check-input"
              type="checkbox"
              onClick={this.toggleFilterByType} />
          </div>

          {this.state.filterByTypeEnabled &&
            <div className="category-dropdown">
              {this.state.listingTypes.map((listingType, i) =>
                <>
                  <div className={`category ${this.isExpandedCategory(listingType.type) ? 'expanded' : 'collapsed'}`}
                      onClick={() => this.toggleCategory(listingType.type)}
                      key={i}>
                      <input type="checkbox" checked={this.isCheckedCategory()} onChange={this.onCategoryCheck}/>
                      {listingType.translationName.defaultMessage}
                  </div>
                  {this.isExpandedCategory(listingType.type) &&
                    this.state.listingSchemasByCategory[listingType.type].map((listingSchema, y) =>
                      <div className="subcategory">
                        <input type="checkbox" />{listingSchema.translationName.defaultMessage}
                      </div>
                    )
                  }
                </>
              )}
            </div>
          }
        </div>

        <div className="form-actions clearfix">
          <button onClick={() => this.setState({ redirect: '/customize' })}
              className="btn btn-outline-primary btn-lg btn-left">
            Back
          </button>

          <button type="submit"
              className="btn btn-primary btn-lg btn-right"
              onClick={this.handleSubmit}>
            Done
          </button>
        </div>
      </form>
    )
  }

  renderRedirect () {
    if (this.state.redirect !== null) {
      return <Redirect to={this.state.redirect} />
    }
  }
}

require('react-styl')(`
  .option
    background-color: var(--pale-grey-four)
    border: 1px solid var(--light)
    padding: 0.75rem
    border-radius: var(--default-radius)
    margin-bottom: 0.25rem
    position: relative

  .disabled
    color: var(--light)

  .option .form-check-input
    right: 1rem

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
