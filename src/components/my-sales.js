import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { storeWeb3Intent } from 'actions/App'

import MySaleCard from 'components/my-sale-card'

import origin from '../services/origin'

class MySales extends Component {
  constructor(props) {
    super(props)
    this.state = { filter: 'pending', purchases: [], loading: true }
  }

  componentDidMount() {
    if (!web3.givenProvider || !this.props.web3Account) {
      this.props.storeWeb3Intent('view your sales')
    }
  }

  async componentWillMount() {
    const listingsFor = await origin.contractService.currentAccount()
    const listingIds = await origin.marketplace.getListings({ listingsFor })
    const listingPromises = listingIds.map(listingId => {
      return new Promise(async resolve => {
        const listing = await origin.marketplace.getListing(listingId)
        resolve({ listingId, listing })
      })
    })
    const withListings = await Promise.all(listingPromises)
    const offerPromises = await withListings.map(obj => {
      return new Promise(async resolve => {
        const offers = await origin.marketplace.getOffers(obj.listingId)
        resolve(Object.assign(obj, { offers }))
      })
    })
    const withOffers = await Promise.all(offerPromises)
    const offersByListing = withOffers.map(obj => {
      return obj.offers.map(offer => Object.assign({}, obj, { offer }))
    })
    const offersFlattened = [].concat(...offersByListing)
    this.setState({ loading: false, purchases: offersFlattened })
  }

  render() {
    const { filter, loading, purchases } = this.state
    const filteredPurchases = purchases.filter(obj => {
      const step = Number(obj.offer.status)
      if (filter === 'pending') {
        return step < 4
      } else if (filter === 'complete') {
        return step >= 4
      } else {
        return true
      }
    })

    return (
      <div className="my-purchases-wrapper">
        <div className="container">
          {loading && (
            <div className="row">
              <div className="col-12 text-center">
                <h1>
                  <FormattedMessage
                    id={'my-sales.loading'}
                    defaultMessage={'Loading...'}
                  />
                </h1>
              </div>
            </div>
          )}
          {!loading &&
            !purchases.length && (
            <div className="row">
              <div className="col-12 text-center">
                <img src="images/empty-listings-graphic.svg" />
                <h1>
                  <FormattedMessage
                    id={'my-sales.no-sales'}
                    defaultMessage={"You don't have any sales yet."}
                  />
                </h1>
                <p>
                  <FormattedMessage
                    id={'my-sales.no-sales-text'}
                    defaultMessage={'Click below to view your listings.'}
                  />
                </p>
                <br />
                <a href="#/my-listings" className="btn btn-lrg btn-primary">
                  <FormattedMessage
                    id={'my-sales.view-listings'}
                    defaultMessage={'My Listings'}
                  />
                </a>
              </div>
            </div>
          )}
          {!loading &&
            !!purchases.length && (
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-12">
                    <h1>
                      <FormattedMessage
                        id={'my-sales.mySalesHeading'}
                        defaultMessage={'My Sales'}
                      />
                    </h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <div className="filters list-group flex-row flex-md-column">
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'pending' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'pending' })}
                      >
                        <FormattedMessage
                          id={'my-sales.pending'}
                          defaultMessage={'Pending'}
                        />
                      </a>
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'complete' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'complete' })}
                      >
                        <FormattedMessage
                          id={'my-sales.complete'}
                          defaultMessage={'Complete'}
                        />
                      </a>
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'all' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'all' })}
                      >
                        <FormattedMessage
                          id={'my-sales.all'}
                          defaultMessage={'All'}
                        />
                      </a>
                    </div>
                  </div>
                  <div className="col-12 col-md-9">
                    <div className="my-listings-list">
                      {filteredPurchases.map(p => (
                        <MySaleCard
                          key={p.offer.id}
                          listing={p.listing}
                          purchase={p.offer}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MySales)
