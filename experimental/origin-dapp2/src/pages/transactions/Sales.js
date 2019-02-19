import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import TokenPrice from 'components/TokenPrice'
import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import PageTitle from 'components/PageTitle'
import LoadingSpinner from 'components/LoadingSpinner'

import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/Sales'

const nextPage = nextPageFactory('marketplace.user.sales')

class Sales extends Component {
  render() {
    const vars = { first: 5, id: this.props.wallet }
    const filter = get(this.props, 'match.params.filter', 'pending')
    if (filter !== 'all') {
      vars.filter = filter
    }

    return (
      <div className="container purchases">
        <PageTitle>My Sales</PageTitle>
        <Query
          query={query}
          variables={vars}
          notifyOnNetworkStatusChange={true}
          skip={!this.props.wallet}
        >
          {({ error, data, fetchMore, networkStatus }) => {
            if (networkStatus === 1 || !this.props.wallet) {
              return <LoadingSpinner />
            } else if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }

            const { nodes, pageInfo, totalCount } = data.marketplace.user.sales
            const { hasNextPage, endCursor: after } = pageInfo

            if (!totalCount) {
              return <NoSales />
            }

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <h1>My Sales</h1>
                  <div className="row">
                    <div className="col-md-3">
                      <ul className="nav nav-pills flex-column">
                        <li className="nav-item">
                          <NavLink className="nav-link" to="/my-sales" exact>
                            Pending
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink className="nav-link" to="/my-sales/complete">
                            Complete
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink className="nav-link" to="/my-sales/all">
                            All
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-9">
                      {nodes.map(({ listing, ...offer }) => (
                        <div
                          className="purchase"
                          key={`${listing.id}-${offer.id}`}
                        >
                          {listing.media && listing.media.length ? (
                            <div
                              className="main-pic"
                              style={{
                                backgroundImage: `url(${
                                  listing.media[0].urlExpanded
                                })`
                              }}
                            />
                          ) : null}
                          <div className="details">
                            <div className="top">
                              <div className="category">
                                {listing.categoryStr}
                              </div>
                              <div className="status">{offer.statusStr}</div>
                            </div>
                            <div className="title">
                              <Link to={`/purchases/${offer.id}`}>
                                {listing.title}
                              </Link>
                            </div>
                            <div className="date">{`Offer made on ${dayjs
                              .unix(offer.createdEvent.timestamp)
                              .format('MMMM D, YYYY')}`}</div>
                            <div className="price">
                              <TokenPrice {...offer} />
                            </div>
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
                    </div>
                  </div>
                </>
              </BottomScrollListener>
            )
          }}
        </Query>
      </div>
    )
  }
}

const NoSales = () => (
  <div className="row">
    <div className="col-12 text-center">
      <img src="images/empty-listings-graphic.svg" />
      <h1>You don&apos;t have any sales yet.</h1>
      <p>Click below to view your listings.</p>
      <br />
      <Link to="/my-listings" className="btn btn-lg btn-primary btn-rounded">
        My Listings
      </Link>
    </div>
  </div>
)

export default withWallet(Sales)

require('react-styl')(`
`)
