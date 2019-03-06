import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { storeWeb3Intent } from 'actions/App'

import MySaleCard from 'components/my-sale-card'

import { transformPurchasesOrSales } from 'utils/listing'

import origin from '../services/origin'

const { web3 } = origin.contractService

class MySales extends Component {
  constructor(props) {
    super(props)
    this.state = { filter: 'pending', purchases: [], loading: true }
  }

  componentDidMount() {
    if (
      this.props.wallet.address &&
      (!web3.currentProvider.isOrigin || origin.contractService.walletLinker)
    ) {
      this.loadPurchases()
    } else if (web3.currentProvider.isOrigin) {
      this.props.storeWeb3Intent('view your sales')
      origin.contractService.showLinkPopUp()
    }
  }

  componentDidUpdate(prevProps) {
    const { wallet } = this.props

    // on account change
    if (wallet.address && wallet.address !== prevProps.wallet.address) {
      this.loadPurchases()
    }
  }

  async loadPurchases() {
    const { wallet } = this.props
    const sales = await origin.marketplace.getSales(wallet.address)
    const transformedSales = await transformPurchasesOrSales(sales)
    this.setState({ loading: false, purchases: transformedSales })
  }

  render() {
    const { filter, loading, purchases } = this.state
    const completedStates = [
      'withdrawn',
      'finalized',
      'sellerReviewed',
      'ruling'
    ]
    const filteredPurchases = purchases.filter(({ offer }) => {
      const completed = completedStates.includes(offer.status)

      if (filter === 'pending') {
        return !completed
      } else if (filter === 'complete') {
        return completed
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

const mapStateToProps = ({ app, wallet }) => {
  return {
    wallet,
    web3Intent: app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MySales)
