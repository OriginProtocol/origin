import React, { Component } from 'react'
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

class Listings extends Component {
  render() {
    const vars = { first: 5, id: this.props.walletProxy }

    const filter = get(this.props, 'match.params.filter', 'all')
    if (filter !== 'all') {
      vars.filter = filter
    }

    return (
      <div className="container transactions">
        <DocumentTitle
          pageTitle={<fbt desc="Listings.title">My Listings</fbt>}
        />
        <h1 className="d-none d-md-block">
          <fbt desc="Listings.myListings">My Listings</fbt>
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
            if (networkStatus <= 2 || !this.props.wallet) {
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
}

const NoListings = ({ filter }) => (
  <div className="text-center">
    <img src="images/empty-listings-graphic.svg" />
    {filter === 'all' && (
      <>
        <h1>
          <fbt desc="Listings.none">You don&apos;t have any listings yet.</fbt>
        </h1>
        <br />
        <Link to="/create" className="btn btn-lg btn-primary btn-rounded">
          Create Your First Listing
        </Link>
      </>
    )}
    {filter === 'active' && (
      <>
        <h1>
          <fbt desc="Listings.noActive">
            You don&apos;t have any active listings.
          </fbt>
        </h1>
        <br />
        <Link to="/create" className="btn btn-lg btn-primary btn-rounded">
          <fbt desc="Listings.create">Create A Listing</fbt>
        </Link>
      </>
    )}
    {filter === 'inactive' && (
      <>
        <h1>
          <fbt desc="Listings.noInactive">
            You don&apos;t have any inactive listings.
          </fbt>
        </h1>
        <br />
        <Link to="/create" className="btn btn-lg btn-primary btn-rounded">
          <fbt desc="Listings.create">Create A Listing</fbt>
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
        <Price listing={listing} descriptor />
        {listing.unitsTotal === undefined ? null : (
          <div className="d-none d-sm-block">
            <fbt desc="Listings.totalQuantity">
              {`Total quantity: `}
              <fbt:param name="content">{listing.unitsTotal}</fbt:param>
            </fbt>
          </div>
        )}
        {listing.unitsAvailable === undefined ? null : (
          <div>
            <fbt desc="Listings.unitsAvailable">
              {`Total remaining: `}
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
    max-width: 760px
    .listings
      .listing
        display: flex
        line-height: normal
        font-weight: normal
        padding-bottom: 1.75rem
        &:not(:last-of-type)
          border-bottom: 1px solid #c0cbd4
          margin-bottom: 1.75rem
        .main-pic-wrap
          margin-right: 1.5rem
          .main-pic
            width: 7.5rem
            height: 7.5rem
            background-size: cover
            background-position: center
            border-radius: 5px
        .details
          flex: 1
          .top
            display: flex
            justify-content: space-between
            align-items: center
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
          margin-bottom: 1rem
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
  @media (max-width: 767.98px)
    .container.transactions
      padding-top: 0.75rem
      .listings .listing
        padding-bottom: 1.25rem
        &:not(:last-of-type)
          margin-bottom: 1.25rem
        .main-pic-wrap
          margin-right: 0.75rem
          .main-pic
            width: 3.75rem
            height: 3.75rem
        .details
          .top .title
            font-size: 18px
          .date
            margin-bottom: 0.5rem
          .price
            font-size: 14px
            margin-bottom: 0.5rem
            > div
              margin-bottom: 0.25rem
              &:not(:last-child)
                margin-right: 1.5rem
`)
