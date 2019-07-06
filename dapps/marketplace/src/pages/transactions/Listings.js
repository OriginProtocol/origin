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

import DocumentTitle from 'components/DocumentTitle'
import Pic from './_Pic'
import { Filter, FilterItem } from './_Filter'

import WithdrawListing from './mutations/WithdrawListing'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/UserListings'

const nextPage = nextPageFactory('marketplace.user.listings')

const Listings = ({ match, wallet, walletProxy }) => {
  const vars = { first: 5, id: walletProxy }

  const filter = get(match, 'params.filter', 'all')
  if (filter !== 'all') {
    vars.filter = filter
  }

  return (
    <div className="container transactions">
      <DocumentTitle pageTitle={<fbt desc="Listings.title">Listings</fbt>} />
      <h1 className="d-none d-md-block">
        <fbt desc="Listings.title">Listings</fbt>
      </h1>

      <Filter>
        <FilterItem to="/my-listings" exact>
          <fbt desc="Listings.all">All</fbt>
        </FilterItem>
        <FilterItem to="/my-listings/active">
          <fbt desc="Listings.active">Active</fbt>
        </FilterItem>
        <FilterItem to="/my-listings/inactive">
          <fbt desc="Listings.inactive">Inactive</fbt>
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
          if (networkStatus <= 2 || !wallet) {
            return <LoadingSpinner />
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          } else if (!data || !data.marketplace) {
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
          } = data.marketplace.user.listings

          if (!totalCount) {
            return <NoListings filter={filter} />
          }

          return (
            <BottomScrollListener
              ready={networkStatus === 7}
              hasMore={hasNextPage}
              onBottom={() => nextPage(fetchMore, { ...vars, after })}
            >
              <div className="listings">
                {nodes.map(listing => (
                  <Listing
                    key={`${listing.id}`}
                    listing={listing}
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

const NoListings = ({ filter }) => (
  <div className="no-transactions text-center">
    <div className="image-container">
      <img src="images/empty-icon.svg" />
    </div>
    {filter === 'all' && (
      <>
        <h3>
          <fbt desc="Listings.none">You don&apos;t have any listings yet.</fbt>
        </h3>
        <Link
          to="/create"
          className="btn btn-lg btn-outline-primary btn-rounded"
        >
          Create Your First Listing
        </Link>
      </>
    )}
    {filter === 'active' && (
      <>
        <h3>
          <fbt desc="Listings.noActive">
            You don&apos;t have any active listings.
          </fbt>
        </h3>
        <Link
          to="/create"
          className="btn btn-lg btn-outline-primary btn-rounded"
        >
          <fbt desc="Listings.create">Create a Listing</fbt>
        </Link>
      </>
    )}
    {filter === 'inactive' && (
      <>
        <h3>
          <fbt desc="Listings.noInactive">
            You don&apos;t have any inactive listings.
          </fbt>
        </h3>
        <Link
          to="/create"
          className="btn btn-lg btn-outline-primary btn-rounded"
        >
          <fbt desc="Listings.create">Create a Listing</fbt>
        </Link>
      </>
    )}
  </div>
)

const Listing = ({ listing, refetch }) => (
  <div className="listing" key={`${listing.id}`}>
    <Pic listing={listing} />
    <div className="details">
      <div className="top">
        <Link className="title mb-1" to={`/listing/${listing.id}`}>
          {listing.title || <i>Untitled Listing</i>}
        </Link>
        <div className={`status ${listing.status}`}>{listing.status}</div>
      </div>
      <div className="date">
        {listing.createdEvent &&
          fbt('Created on', 'Listings.createdOn') +
            ` ${dayjs
              .unix(listing.createdEvent.timestamp)
              .format('MMMM D, YYYY')}`}
      </div>
      <div className="price">
        <div>
          <Price listing={listing} descriptor />
        </div>
        {listing.unitsTotal === undefined ? null : (
          <div>
            <fbt desc="Listings.unitsSold">
              Sold:
              <fbt:param name="content">{listing.unitsSold}</fbt:param>
            </fbt>
          </div>
        )}
        {listing.unitsAvailable === undefined ||
        listing.__typename === 'ServiceListing' ? null : (
          <div>
            <fbt desc="Listings.unitsAvailable">
              Available:
              <fbt:param name="content">{listing.unitsAvailable}</fbt:param>
            </fbt>
          </div>
        )}
      </div>
      {listing.status !== 'active' ? null : (
        <div className="actions">
          <Link
            to={`/listing/${listing.id}/edit`}
            children={fbt('Edit', 'Edit')}
          />
          <WithdrawListing listing={listing} refetch={refetch} />
        </div>
      )}
    </div>
  </div>
)

export default withWallet(Listings)

require('react-styl')(`
  .container.transactions
    padding-top: 3rem
    max-width: 760px
    .no-transactions
      .image-container
        padding-right: 90px
        img
          max-width: 75%
    .listings,.purchases,.sales
      .listing,.purchase,.sale
        display: flex
        align-items: flex-start
        line-height: normal
        font-weight: normal
        padding-bottom: 1.75rem
        &:not(:last-of-type)
          border-bottom: 1px solid #c0cbd4
          margin-bottom: 1.75rem
        .pic
          margin-right: 1.5rem
          position: relative
          .main-pic
            width: 7.5rem
            height: 7.5rem
            background-size: cover
            background-position: center
            border-radius: 5px
            &.empty
              background: var(--light) url(images/default-image.svg)
              background-repeat: no-repeat
              background-position: center
              background-size: 40%
          .quantity
            position: absolute
            bottom: -8px
            right: 0
            padding: 4px 8px
            background: #fff
            box-shadow: 0px 0px 5px 2px #ddd
            border-radius: 1rem
            font-size: 14px
            font-weight: 900
        .details
          flex: 1
          min-width: 0px
          .top
            display: flex
            justify-content: space-between
            align-items: flex-start
            .title
              font-size: 24px
              font-weight: bold
              color: black

            .status
              color: var(--white)
              border-radius: 3px
              background-color: var(--greenblue)
              text-transform: uppercase
              font-weight: bold
              font-size: 11px
              padding: 3px 6px
              &.pending
                background-color: var(--gold)
              &.withdrawn
                background-color: var(--orange-red)
        .date
          color: var(--steel)
          font-size: 14px
        .price
          font-size: 18px
          display: flex
          flex-wrap: wrap
          margin-bottom: 1rem
          > div
            &:not(:last-child)
              margin-right: 3rem
            &:first-child
              font-weight: bold
              .desc
                margin-left: 0.5ex
                font-size: 14px
                color: var(--steel)
        .actions
          font-size: 14px
          a:not(:last-of-type)
            margin-right: 2rem

  .listings .listing
    .date
      margin-bottom: 1rem

  @media (max-width: 767.98px)
    .container.transactions
      padding-top: 0.75rem
      .no-transactions
        h3
          padding: 0 1rem
          margin-bottom: 2rem
        img
          margin: 1rem 0 2rem 0
      .listings,.purchases,.sales
        .btn
          display: block
          margin-left: auto
          margin-right: auto
        .listing,.purchase,.sale
          padding-bottom: 1.25rem
          &:not(:last-of-type)
            margin-bottom: 1.25rem
          .pic
            margin-right: 0.75rem
            .main-pic
              width: 3.75rem
              height: 3.75rem
          .details
            .top
              .title
                font-size: 18px
              .status
                font-size: 9px
            .date
              margin-bottom: 0.5rem
            .price
              font-size: 14px
              margin-bottom: 0.5rem
              display: flex
              justify-content: space-between
              > div
                margin-bottom: 0.25rem
                margin-right: 0
`)
