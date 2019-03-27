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
import NavLink from 'components/NavLink'
import DocumentTitle from 'components/DocumentTitle'
import Pic from './_Pic'

import WithdrawListing from './mutations/WithdrawListing'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/UserListings'

const nextPage = nextPageFactory('marketplace.user.listings')

class Listings extends Component {
  render() {
    const vars = { first: 5, id: this.props.wallet }
    const filter = get(this.props, 'match.params.filter', 'pending')
    if (filter !== 'all') {
      vars.filter = filter
    }

    return (
      <div className="container transactions">
        <DocumentTitle
          pageTitle={<fbt desc="Listings.title">My Listings</fbt>}
        />
        <h1>
          <fbt desc="Listings.myListings">My Listings</fbt>
        </h1>
        <div className="row">
          <div className="col-md-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings" exact>
                  <fbt desc="Listings.all">All</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings/active">
                  <fbt desc="Listings.active">Active</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings/inactive">
                  <fbt desc="Listings.inactive">Inactive</fbt>
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
              {({ error, data, fetchMore, networkStatus, refetch }) => {
                if (networkStatus <= 2 || !this.props.wallet) {
                  return <LoadingSpinner />
                } else if (error) {
                  return <QueryError error={error} query={query} vars={vars} />
                } else if (!data || !data.marketplace) {
                  return (
                    <p className="p-3">
                      <fbt desc="Listings.noContract">
                        No marketplace contract?
                      </fbt>
                    </p>
                  )
                }

                const {
                  nodes,
                  pageInfo,
                  totalCount
                } = data.marketplace.user.listings
                const { hasNextPage, endCursor: after } = pageInfo

                return (
                  <BottomScrollListener
                    ready={networkStatus === 7}
                    hasMore={hasNextPage}
                    onBottom={() => nextPage(fetchMore, { ...vars, after })}
                  >
                    <>
                      {totalCount > 0 ? null : <NoListings />}
                      {nodes.map(listing => (
                        <div className="purchase" key={`${listing.id}`}>
                          <Pic listing={listing} />
                          <div className="details">
                            <div className="top">
                              <div className="category">
                                {listing.categoryStr}
                              </div>

                              <div className={`status ${listing.status}`}>
                                {listing.status}
                              </div>
                            </div>
                            <div className="title">
                              <Link to={`/listing/${listing.id}`}>
                                {listing.title}
                              </Link>
                            </div>
                            <div className="date">
                              {listing.createdEvent &&
                                fbt('Listed on', 'Listings.listedOn') +
                                  ` ${dayjs
                                    .unix(listing.createdEvent.timestamp)
                                    .format('MMMM D, YYYY')}`}
                            </div>
                            <div className="price">
                              <Price listing={listing} descriptor />
                            </div>
                            {listing.status !== 'active' ? null : (
                              <div className="actions">
                                <Link
                                  to={`/listing/${listing.id}/edit`}
                                  children={fbt('Edit Listing', 'Edit Listing')}
                                />
                                <WithdrawListing
                                  listing={listing}
                                  refetch={refetch}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {!hasNextPage ? null : (
                        <button
                          children={
                            networkStatus === 3
                              ? fbt('Loading...', 'Listings.loading')
                              : fbt('Load more', 'Listings.loadMore')
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

const NoListings = () => (
  <div className="row">
    <div className="col-12 text-center">
      <img src="images/empty-listings-graphic.svg" />
      <h1>You don&apos;t have any listings yet.</h1>
      <p>Follow the steps below to create your first listing!</p>
      <br />
      <Link to="/create" className="btn btn-lg btn-primary btn-rounded">
        Create Your First Listing
      </Link>
    </div>
  </div>
)

export default withWallet(Listings)

require('react-styl')(`
`)
