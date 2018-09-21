import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import Pagination from 'react-js-pagination'
import { withRouter } from 'react-router'

import { getListingIds } from 'actions/Listing'

import ListingCard from 'components/listing-card'
import OnboardingModal from 'components/onboarding-modal'
import { LISTINGS_PER_PAGE } from 'components/constants'

class ListingsGrid extends Component {
  constructor(props) {
    super(props)

    this.handleOnChange = this.handleOnChange.bind(this)
  }

  componentWillMount() {
    if (this.props.renderMode === 'home-page') this.props.getListingIds()
  }

  handleOnChange(page) {
    if (this.props.renderMode === 'home-page')
      this.props.history.push(`/page/${page}`)
    else
      this.props.handleChangePage(page)
  }

  render() {
    const { contractFound, listingIds, search } = this.props

    // const pinnedListingIds = [0, 1, 2, 3, 4]
    // const arrangedListingIds = [...pinnedListingIds, ...listingIds.filter(id => !pinnedListingIds.includes(id))]

    let allListingsLength, activePage, showListingsIds
    if (this.props.renderMode === 'home-page'){
      allListingsLength = listingIds.length
      activePage = this.props.match.params.activePage || 1 

      // Calc listings to show for given page
      showListingsIds = listingIds.slice(
        LISTINGS_PER_PAGE * (activePage - 1),
        LISTINGS_PER_PAGE * activePage
      )

    } else if (this.props.renderMode === 'search'){
      activePage = this.props.searchPage 
      allListingsLength = search.listingsLength
      showListingsIds = search.listingIds
    }

    return (
      <div className="listings-wrapper">
        {contractFound === false && (
          <div className="listings-grid">
            <div className="alert alert-warning" role="alert">
              <FormattedMessage
                id={'listings-grid.originContractNotFound'}
                defaultMessage={
                  'No Origin listing contracts were found on this network.'
                }
              />
              <br />
              <FormattedMessage
                id={'listings-grid.changeNetworks'}
                defaultMessage={
                  'You may need to change networks, or deploy the contract.'
                }
              />
            </div>
          </div>
        )}
        {contractFound && (
          <div className="listings-grid">
            {allListingsLength > 0 && (
              <h1>
                <FormattedMessage
                  id={'listings-grid.listingsCount'}
                  defaultMessage={'{listingIdsCount} Listings'}
                  values={{
                    listingIdsCount: (
                      <FormattedNumber value={allListingsLength} />
                    )
                  }}
                />
              </h1>
            )}
            <div className="row">
              {showListingsIds.map(listingId => (
                <ListingCard listingId={listingId} key={listingId} />
              ))}
            </div>
            <Pagination
              activePage={parseInt(activePage)}
              itemsCountPerPage={LISTINGS_PER_PAGE}
              totalItemsCount={allListingsLength}
              pageRangeDisplayed={5}
              onChange={this.handleOnChange}
              itemClass="page-item"
              linkClass="page-link"
              hideDisabled="true"
            />
          </div>
        )}
        <OnboardingModal />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  listingIds: state.marketplace.ids,
  contractFound: state.listings.contractFound
})

const mapDispatchToProps = dispatch => ({
  getListingIds: () => dispatch(getListingIds())
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(ListingsGrid)
)
