import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import TokenPrice from 'components/TokenPrice'
import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'
import LoadingSpinner from 'components/LoadingSpinner'
import Stages from 'components/TransactionStages'
import Pic from './_Pic'
import OfferStatus from './_OfferStatus'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/Purchases'

const nextPage = nextPageFactory('marketplace.user.offers')

class Purchases extends Component {
  render() {
    const vars = { first: 5, id: this.props.wallet }
    const filter = get(this.props, 'match.params.filter', 'pending')
    if (filter !== 'all') {
      vars.filter = filter
    }

    return (
      <div className="container transactions">
        <PageTitle><fbt desc="Purchases.myPurchases">My Purchases</fbt></PageTitle>
        <h1><fbt desc="Purchases.myPurchases">My Purchases</fbt></h1>
        <div className="row">
          <div className="col-md-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-purchases" exact>
                  <fbt desc="Purchases.pending">Pending</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-purchases/complete">
                  <fbt desc="Purchases.complete">Complete</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-purchases/all">
                  <fbt desc="Purchases.all">All</fbt>
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="col-md-9">
            <Query
              query={query}
              variables={vars}
              notifyOnNetworkStatusChange={true}
              skip={!this.props.wallet}
            >
              {({ error, data, fetchMore, networkStatus }) => {
                if (networkStatus <= 2 || !this.props.wallet) {
                  return <LoadingSpinner />
                } else if (error) {
                  return <QueryError error={error} query={query} vars={vars} />
                } else if (!data || !data.marketplace) {
                  return <p className="p-3"><fbt desc="Purchases.noContracts">No marketplace contract?</fbt></p>
                }

                const {
                  nodes,
                  pageInfo,
                  totalCount
                } = data.marketplace.user.offers
                const { hasNextPage, endCursor: after } = pageInfo

                return (
                  <BottomScrollListener
                    ready={networkStatus === 7}
                    hasMore={hasNextPage}
                    onBottom={() => nextPage(fetchMore, { ...vars, after })}
                  >
                    <>
                      {totalCount > 0 ? null : <NoPurchases />}
                      {nodes.map(({ listing, ...offer }) => (
                        <div
                          className="purchase"
                          key={`${listing.id}-${offer.id}`}
                        >
                          <Pic listing={listing} />
                          <div className="details">
                            <div className="top">
                              <div className="category">
                                {listing.categoryStr}
                              </div>
                              <OfferStatus offer={offer} />
                            </div>
                            <div className="title">
                              <Link to={`/purchases/${offer.id}`}>
                                {listing.title}
                              </Link>
                            </div>
                            <div className="date">
                              <fbt desc="Purchases.offerMadeOn">Offer made on</fbt>>
                              {` ${dayjs
                              .unix(offer.createdEvent.timestamp)
                              .format('MMMM D, YYYY')}`}</div>
                            <div className="price">
                              <TokenPrice {...offer} />
                            </div>
                            <Stages offer={offer} />
                          </div>
                        </div>
                      ))}
                      {!hasNextPage ? null : (
                        <button
                          children={
                            networkStatus === 3 ? fbt('Loading...', 'Purchases.loading') : fbt('Load more', 'Purchases.loadMore')
                          }
                          className="btn btn-outline-primary btn-rounded mt-3"
                          onClick={() =>
                            nextPage(fetchMore, { ...vars, after })
                          }
                        />
                      )}
                    </>
                  </BottomScrollListener>
                )
              }}
            </Query>
          </div>
        </div>
      </div>
    )
  }
}

const NoPurchases = () => (
  <div className="row">
    <div className="col-12 text-center">
      <img src="images/empty-listings-graphic.svg" />
      <h1>You haven’t bought anything yet.</h1>
      <p>Click below to view all listings.</p>
      <br />
      <Link to="/" className="btn btn-lg btn-primary btn-rounded">
        Browse Listings
      </Link>
    </div>
  </div>
)

export default withWallet(Purchases)

require('react-styl')(`
  .transactions
    padding-top: 3rem
    .nav-pills
      margin-bottom: 2rem
      flex-direction: column
      .nav-link
        color: var(--dark-grey-blue)
        &.active
          background-color: var(--dark-grey-blue)
          color: var(--white)
    .purchase
      border: 1px solid var(--pale-grey-two);
      border-radius: var(--default-radius);
      padding: 0.5rem;
      display: flex
      margin-bottom: 1rem
      .main-pic-wrap
        width: 100%
        max-width: 300px
        margin-right: 1rem
      .main-pic
        width: 100%
        padding-top: 66.6%
        background-size: cover
        background-repeat: no-repeat
        background-position: center top
        &.empty
          background: var(--light) url(images/default-image.svg)
          background-repeat: no-repeat
          background-position: center
      .details
        flex: 1
        display: flex
        flex-direction: column
      .top
        display: flex
        align-items: flex-start
        justify-content: space-between
        > .category
          text-transform: uppercase
          color: var(--dusk)
          font-weight: normal
          font-size: 14px
        > .status
          color: var(--greenblue)
          text-transform: uppercase
          font-weight: 900
          font-size: 11px
          &.pending
            color: var(--gold)
          &.withdrawn
            color: var(--orange-red)
      .title
        font-size: 24px
        font-weight: normal
      .date
        color: var(--dusk)
        font-size: 12px
        font-weight: 300
      .price
        font-weight: normal
        margin-top: 0.5rem
      .stages
        margin: 1rem 0
        flex: 1
      .actions
        font-size: 12px
        font-weight: normal
        > a
          margin-right: 1rem

  @media (max-width: 767.98px)
    .transactions
      padding-top: 2rem
      h1
        font-size: 32px
        margin-bottom: 1rem
        line-height: 1.25
      .nav-pills
        flex-direction: row
        .nav-item
          flex: 1
          text-align: center
      .purchase
        flex-direction: column
        .main-pic-wrap
          margin: 0 auto 1rem auto
`)
