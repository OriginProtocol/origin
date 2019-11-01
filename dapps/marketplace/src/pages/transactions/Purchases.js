import React from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import Price from 'components/Price'
import Link from 'components/Link'
import LoadingSpinner from 'components/LoadingSpinner'
import BottomScrollListener from 'components/BottomScrollListener'
import Stages from 'components/TransactionStages'

import DocumentTitle from 'components/DocumentTitle'
import Pic from 'components/ListingPic'
import { Filter, FilterItem } from './_Filter'
import OfferStatus from './_OfferStatus'

import nextPageFactory from 'utils/nextPageFactory'
import distanceToNow from 'utils/distanceToNow'
import query from 'queries/Purchases'

const nextPage = nextPageFactory('marketplace.user.offers')

const Listings = ({ match, wallet, walletProxy }) => {
  const filter = get(match, 'params.filter', 'pending')
  const vars = { first: 5, id: walletProxy, filter }

  return (
    <div className="container transactions">
      <DocumentTitle pageTitle={<fbt desc="Purchases.title">Purchases</fbt>} />
      <h1 className="d-none d-md-block">
        <fbt desc="Purchases.title">Purchases</fbt>
      </h1>

      <Filter>
        <FilterItem to="/my-purchases" exact>
          <fbt desc="Purchases.pending">Pending</fbt>
        </FilterItem>
        <FilterItem to="/my-purchases/active">
          <fbt desc="Purchases.complete">Complete</fbt>
        </FilterItem>
        <FilterItem to="/my-purchases/inactive">
          <fbt desc="Purchases.all">All</fbt>
        </FilterItem>
      </Filter>

      <Query
        query={query}
        variables={vars}
        notifyOnNetworkStatusChange={true}
        skip={!vars.id}
        fetchPolicy="cache-and-network"
      >
        {({ error, data, fetchMore, networkStatus, refetch }) => {
          const offers = get(data, 'marketplace.user.offers')
          if (networkStatus <= 2 || !wallet) {
            return <LoadingSpinner />
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (!offers) {
            return (
              <p className="p-3">
                <fbt desc="Listings.noContract">No marketplace contract?</fbt>
              </p>
            )
          }

          const {
            nodes,
            pageInfo: { hasNextPage, endCursor: after },
            totalCount
          } = offers

          if (!totalCount) {
            return <NoPurchases filter={filter} />
          }

          return (
            <BottomScrollListener
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <div className="purchases">
                {nodes.map(({ listing, ...offer }) => (
                  <Purchase
                    key={`${listing.id}-${offer.id}`}
                    listing={listing}
                    offer={offer}
                    refetch={refetch}
                  />
                ))}
                {!hasNextPage ? null : (
                  <button
                    children={
                      networkStatus === 3
                        ? fbt('Loading...', 'Listings.loading')
                        : fbt('Load more', 'Listings.loadMore')
                    }
                    className="btn btn-outline-primary btn-rounded mt-3"
                    onClick={() => nextPage(fetchMore, { ...vars, after })}
                  />
                )}
              </div>
            </BottomScrollListener>
          )
        }}
      </Query>
    </div>
  )
}

const NoPurchases = () => (
  <div className="no-transactions text-center">
    <div className="image-container">
      <img src="images/empty-icon.svg" />
    </div>
    <h3>You haven’t bought anything yet.</h3>
    <Link to="/" className="btn btn-lg btn-outline-primary btn-rounded">
      Browse Listings
    </Link>
  </div>
)

const Purchase = ({ listing, offer }) => (
  <Link className="purchase" to={`/purchases/${offer.id}`}>
    <div className="pic">
      <Pic listing={listing} />
      {offer.quantity === undefined || offer.quantity <= 1 ? null : (
        <div className="quantity">{offer.quantity}</div>
      )}
    </div>
    <div className="details">
      <div className="top">
        <h2 className="title mb-1">
          {listing.title || <i>Untitled Listing</i>}
        </h2>
        <div className="right">
          <span className="time-estimate">
            {distanceToNow(offer.createdEvent.timestamp, true) + ' ago'}
          </span>
          <OfferStatus offer={offer} />
        </div>
      </div>
      <div className="date">
        {listing.createdEvent &&
          fbt('Offer made on', 'Purchases.offerMadeOn') +
            ` ${dayjs
              .unix(offer.createdEvent.timestamp)
              .format('MMMM D, YYYY')}`}
      </div>
      <div className="price">
        <div className="d-flex">
          <Price price={offer.totalPrice} />
        </div>
      </div>
      <Stages mini offer={offer} />
    </div>
  </Link>
)

export default withWallet(Listings)

require('react-styl')(`
  .no-transactions
    .image-container
      padding-right: 90px
      img
        max-width: 75%
  .container.transactions
    padding-top: 3rem
    max-width: 760px
    .purchases .purchase,
    .sales .sale
      .right
        display: flex
        font-size: 14px
        color: var(--bluey-grey)
        align-items: flex-start
        .status
          margin-left: 0.5rem
      .date
        margin-bottom: 0.5rem
  @media (max-width: 767.98px)
    .container.transactions
      .purchases .purchase,
      .sales .sale
        .right
          .time-estimate
            display: none
`)
