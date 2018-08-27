import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import Pagination from 'react-js-pagination'
import { withRouter } from 'react-router'

import { getListingIds } from 'actions/Listing'

import ListingCard from 'components/listing-card'
import OnboardingModal from 'components/onboardingModal/split-panel'
import Modal from 'components/modal'

class ListingsGrid extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listingsPerPage: 12,
      learnMore: true,
      onBoardingModal: false
    }

    this.closeModal = this.closeModal.bind(this)
  }

  componentWillMount() {
    this.props.getListingIds()
  }

  closeModal(name='onBoardingModal') {
    return () => {
      this.setState({ [name]: false })
    }
  }

  openOnBoardingModal() {
    this.setState({ learnMore: false, onBoardingModal: true })
  }

  render() {
    const { listingsPerPage, onBoardingModal, learnMore } = this.state
    const { contractFound, listingIds, hideList } = this.props
    // const pinnedListingIds = [0, 1, 2, 3, 4]
    // const arrangedListingIds = [...pinnedListingIds, ...listingIds.filter(id => !pinnedListingIds.includes(id))]
    const arrangedListingIds = listingIds
    const activePage = this.props.match.params.activePage || 1
    // Calc listings to show for given page
    const showListingsIds = arrangedListingIds.slice(
      listingsPerPage * (activePage - 1),
      listingsPerPage * activePage
    )

    const learnMoreContent = (
      <div>
        <div className="text-right">
          <img src="/images/close-icon.svg" alt="close-icon" onClick={this.closeModal('learnMore')}/>
        </div>
        <img src="/images/eth-tokens.svg" alt="eth-tokens" />
        <h3>Get Started Selling on Origin!</h3>
        <p>Learn how to sell on our DApp today.</p>
        <button className='btn btn-primary' onClick={() => this.openOnBoardingModal()}>Learn more</button>
      </div>
    )

    return (
      <div className="listings-wrapper">
        <OnboardingModal isOpen={onBoardingModal} closeModal={this.closeModal('onBoardingModal')}/>
        {contractFound === false && (
          <div className="listings-grid">
            <div className="alert alert-warning" role="alert">
              <FormattedMessage
                id={'listings-grid.originContractNotFound'}
                defaultMessage={
                  'The Origin Contract was not found on this network.'
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
                <ListingCard
                  listingId={listingId}
                  key={listingId}
                  hideList={hideList}
                />
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
        <Modal className={'getting-started'} isOpen={learnMore} children={learnMoreContent}/>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  listingIds: state.marketplace.ids,
  hideList: state.listings.hideList,
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
