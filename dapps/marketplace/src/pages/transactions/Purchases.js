import React from 'react'
import { useQuery } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import LoadingSpinner from 'components/LoadingSpinner'
import BottomScrollListener from 'components/BottomScrollListener'

import DocumentTitle from 'components/DocumentTitle'
import { Filter, FilterItem } from './_Filter'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/Purchases'

import Purchase from './_Purchase'
import NoPurchases from './_NoPurchases'

const nextPage = nextPageFactory('marketplace.user.offers')

const FilteredListings = ({ match, wallet, walletProxy }) => {
  const filter = get(match, 'params.filter', 'pending')
  const vars = { first: 5, id: walletProxy, filter }

  const { error, data, fetchMore, networkStatus, refetch } = useQuery(query, {
    variables: vars,
    notifyOnNetworkStatusChange: true,
    skip: !vars.id,
    fetchPolicy: 'cache-and-network'
  })

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
}

const Listings = props => (
  <div className="container transactions">
    <DocumentTitle pageTitle={<fbt desc="Purchases.title">Purchases</fbt>} />
    <h1 className="d-none d-md-block">
      <fbt desc="Purchases.title">Purchases</fbt>
    </h1>

    <Filter>
      <FilterItem to="/my-purchases/pending" exact>
        <fbt desc="Purchases.pending">Pending</fbt>
      </FilterItem>
      <FilterItem to="/my-purchases/complete">
        <fbt desc="Purchases.complete">Complete</fbt>
      </FilterItem>
      <FilterItem to="/my-purchases/all">
        <fbt desc="Purchases.all">All</fbt>
      </FilterItem>
    </Filter>

    <FilteredListings {...props} />
  </div>
)

export default withWallet(Listings)

require('react-styl')(`
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
