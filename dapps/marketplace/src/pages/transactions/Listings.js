import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import Price from 'components/Price'
import Link from 'components/Link'
import LoadingSpinner from 'components/LoadingSpinner'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import PageTitle from 'components/PageTitle'
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
        <PageTitle>My Listings</PageTitle>

        <h1>My Listings</h1>
        <div className="row">
          <div className="col-md-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings" exact>
                  All
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings/active">
                  Active
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-listings/inactive">
                  Inactive
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
                  return <p className="p-3">No marketplace contract?</p>
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
                              <div className="status">{listing.status}</div>
                            </div>
                            <div className="title">
                              <Link to={`/listing/${listing.id}`}>
                                {listing.title}
                              </Link>
                            </div>
                            <div className="date">
                              {listing.createdEvent &&
                                `Listed on ${dayjs
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
                                  children="Edit Listing"
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
                            networkStatus === 3 ? 'Loading...' : 'Load more'
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
