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
import Pic from './_Pic'
import { Filter, FilterItem } from './_Filter'
import OfferStatus from './_OfferStatus'

import nextPageFactory from 'utils/nextPageFactory'
import distanceToNow from 'utils/distanceToNow'
import query from 'queries/Sales'

const nextPage = nextPageFactory('marketplace.user.sales')

const Sales = ({ match, wallet, walletProxy }) => {
  const filter = get(match, 'params.filter', 'pending')
  const vars = { first: 5, id: walletProxy, filter }

  return (
    <div className="container transactions">
      <DocumentTitle pageTitle={<fbt desc="Sales.title">Sales</fbt>} />
      <h1 className="d-none d-md-block">
        <fbt desc="Sales.title">Sales</fbt>
      </h1>

      <Filter>
        <FilterItem to="/my-sales" exact>
          <fbt desc="Sales.pending">Pending</fbt>
        </FilterItem>
        <FilterItem to="/my-sales/complete">
          <fbt desc="Sales.complete">Complete</fbt>
        </FilterItem>
        <FilterItem to="/my-sales/all">
          <fbt desc="Sales.all">All</fbt>
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
          const sales = get(data, 'marketplace.user.sales')
          if (networkStatus <= 2 || !wallet) {
            return <LoadingSpinner />
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (!sales) {
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
          } = sales

          if (!totalCount) {
            return <NoPurchases filter={filter} />
          }

          return (
            <BottomScrollListener
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <div className="sales">
                {nodes.map(({ listing, ...offer }) => (
                  <Sale
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
                        ? fbt('Loading...', 'Sales.loading')
                        : fbt('Load more', 'Sales.loadMore')
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
    <h3>You haven’t sold anything yet.</h3>
    <Link
      to="/my-listings"
      className="btn btn-lg btn-outline-primary btn-rounded"
    >
      View Listings
    </Link>
  </div>
)

const Sale = ({ listing, offer }) => (
  <div className="sale">
    <Pic listing={listing} />
    <div className="details">
      <div className="top">
        <Link className="title mb-1" to={`/purchases/${offer.id}`}>
          {listing.title || <i>Untitled Listing</i>}
        </Link>
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
        {offer.quantity === undefined || offer.quantity <= 1 ? null : (
          <div className="d-none d-sm-block">
            <fbt desc="Purchases.quantity">
              {`Quantity: `}
              <fbt:param name="content">{offer.quantity}</fbt:param>
            </fbt>
          </div>
        )}
      </div>
      <Stages mini offer={offer} />
    </div>
  </div>
)

export default withWallet(Sales)

require('react-styl')(`
  .no-transactions
    .image-container
      padding-right: 90px
      img
        max-width: 75%
`)
