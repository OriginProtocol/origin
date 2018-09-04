import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import Pagination from 'react-js-pagination'
import { withRouter } from 'react-router'

import { getListingIds } from 'actions/Listing'

import ListingCard from 'components/listing-card'
import OnboardingModal from 'components/onboarding-modal'

class ListingsGrid extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listingsPerPage: 12,
      learnMore: false,
      onBoardingModal: false
    }

    this.closeModal = this.closeModal.bind(this)
    this.openOnBoardingModal = this.openOnBoardingModal.bind(this)
  }

  componentWillMount() {
    const { getListingIds, wallet } = this.props

    getListingIds()
    if (!wallet.address) {
      this.setState({ learnMore: true })
    }
  }

  closeModal(name = 'onBoardingModal') {
    return () => {
      this.setState({ [name]: false })
    }
  }

  openOnBoardingModal() {
    this.setState({ learnMore: false, onBoardingModal: true })
  }

  render() {
    const { listingsPerPage, onBoardingModal, learnMore } = this.state
    const { contractFound, listingIds } = this.props
    // const pinnedListingIds = [0, 1, 2, 3, 4]
    // const arrangedListingIds = [...pinnedListingIds, ...listingIds.filter(id => !pinnedListingIds.includes(id))]
    const arrangedListingIds = listingIds
    const activePage = this.props.match.params.activePage || 1
    // Calc listings to show for given page
    const showListingsIds = arrangedListingIds.slice(
      listingsPerPage * (activePage - 1),
      listingsPerPage * activePage
    )

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
            {listingIds.length > 0 && (
              <h1>
                <FormattedMessage
                  id={'listings-grid.listingsCount'}
                  defaultMessage={'{listingIdsCount} Listings'}
                  values={{
                    listingIdsCount: (
                      <FormattedNumber value={listingIds.length} />
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
              itemsCountPerPage={listingsPerPage}
              totalItemsCount={arrangedListingIds.length}
              pageRangeDisplayed={5}
              onChange={page => this.props.history.push(`/page/${page}`)}
              itemClass="page-item"
              linkClass="page-link"
              hideDisabled="true"
            />
          </div>
        )}
        <OnboardingModal
          learnMore={learnMore}
          isOpen={onBoardingModal}
          closeModal={this.closeModal}
          openOnBoardingModal={this.openOnBoardingModal}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({
  listingIds: state.marketplace.ids,
  contractFound: state.listings.contractFound,
  wallet: state.wallet
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
