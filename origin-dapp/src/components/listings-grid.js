import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import Pagination from 'react-js-pagination'
import { withRouter } from 'react-router'

import { getListingIds } from 'actions/Listing'

import { LISTINGS_PER_PAGE } from 'components/constants'
import ListingCard from 'components/listing-card'

class ListingsGrid extends Component {
  constructor(props) {
    super(props)

    this.handleOnChange = this.handleOnChange.bind(this)
  }

  componentWillMount() {
    if (this.props.renderMode === 'home-page') {
      this.props.getListingIds()
    }
  }

  handleOnChange(page) {
    if (this.props.renderMode === 'home-page') {
      this.props.history.push(`/page/${page}`)
    } else {
      this.props.handleChangePage(page)
    }
  }

  render() {
    const { contractFound, listingIds, search } = this.props
    let activePage, currentPageListingIds, resultsCount

    if (this.props.renderMode === 'home-page') {
      activePage = parseInt(this.props.match.params.activePage) || 1

      const startSlicePosition = Math.max(0, LISTINGS_PER_PAGE * (activePage - 1))
      currentPageListingIds = listingIds.slice(
        startSlicePosition,
        Math.max(0, startSlicePosition + LISTINGS_PER_PAGE)
      )
      resultsCount = listingIds.length
    } else if (this.props.renderMode === 'search') {
      currentPageListingIds = search.listingIds
      activePage = this.props.searchPage
      resultsCount = search.listingsLength
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
            {resultsCount > 0 && (
              <>
                <h1>
                  <FormattedMessage
                    id={'listings-grid.listingsCount'}
                    defaultMessage={'{listingIdsCount} Listings'}
                    values={{
                      listingIdsCount: (
                        <FormattedNumber value={resultsCount} />
                      )
                    }}
                  />
                </h1>
              <div className="row">
                {currentPageListingIds.map(id => (
                  <ListingCard
                    listingId={id}
                    key={id}
                  />
                ))}
              </div>
              <Pagination
                activePage={parseInt(activePage)}
                itemsCountPerPage={LISTINGS_PER_PAGE}
                totalItemsCount={resultsCount}
                pageRangeDisplayed={5}
                onChange={this.handleOnChange}
                itemClass="page-item"
                linkClass="page-link"
                hideDisabled="true"
              />
            </>
          )}

          {resultsCount == 0 && this.props.renderMode !== 'search' && this.props.isWhiteLabel && (
            <div className="row">
              <div className="col-12 text-center">
                <img src="images/empty-listings-graphic.svg" />
                <h1>
                  <FormattedMessage
                    id={'listings.no-listings-whitelabel'}
                    defaultMessage={"Your marketplace doesn't have any listings yet."}
                  />
                </h1>
                <p>
                  <FormattedMessage
                    id={'listings.no-listings-whitelabel-message'}
                    defaultMessage={
                      'You can create listings yourself or invite sellers to join your platform!'
                    }
                  />
                </p>
                <br />
                <br />
                <div className="row">
                  <div className="col text-center">
                    <a
                      href="#/create"
                      className="btn btn-lrg btn-primary btn-auto-width"
                    >
                      <FormattedMessage
                        id={'listings.create-listing'}
                        defaultMessage={'Create a Listing'}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {resultsCount == 0 && this.props.renderMode === 'search' && (
            <div className="row">
              <div className="col-12 text-center">
                <img src="images/empty-listings-graphic.svg" />
                <h1>
                  <FormattedMessage
                    id={'listings.no-search-results'}
                    defaultMessage={'No search results found.'}
                  />
                </h1>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    )
  }
}

const mapStateToProps = state => ({
  contractFound: state.listings.contractFound,
  isWhiteLabel: state.config.isWhiteLabel,
  listingIds: state.listings.ids
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
