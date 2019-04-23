import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'

import QueryError from 'components/QueryError'
import Price from 'components/Price'
import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import DocumentTitle from 'components/DocumentTitle'
import LoadingSpinner from 'components/LoadingSpinner'
import Stages from 'components/TransactionStages'
import Pic from './_Pic'
import OfferStatus from './_OfferStatus'

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
      <div className="container transactions">
        <DocumentTitle pageTitle={<fbt desc="Sales.title">My Sales</fbt>} />
        <h1>
          <fbt desc="Sales.mySales">My Sales</fbt>
        </h1>
        <div className="row">
          <div className="col-md-3">
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-sales" exact>
                  <fbt desc="Sales.pending">Pending</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-sales/complete">
                  <fbt desc="Sales.complete">Complete</fbt>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/my-sales/all">
                  <fbt desc="Sales.all">All</fbt>
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
                  return (
                    <p className="p-3">
                      <fbt desc="Sales.noContract">
                        No marketplace contract?
                      </fbt>
                    </p>
                  )
                }

                const {
                  nodes,
                  pageInfo,
                  totalCount
                } = data.marketplace.user.sales
                const { hasNextPage, endCursor: after } = pageInfo

                return (
                  <BottomScrollListener
                    ready={networkStatus === 7}
                    hasMore={hasNextPage}
                    onBottom={() => nextPage(fetchMore, { ...vars, after })}
                  >
                    <>
                      {totalCount > 0 ? null : <NoSales />}
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
                              <fbt desc="Sales.offerMadeOn">Offer made on</fbt>
                              {` ${dayjs
                                .unix(offer.createdEvent.timestamp)
                                .format('MMMM D, YYYY')}`}
                            </div>
                            <div className="price">
                              <Price price={offer.totalPrice} />
                            </div>
                            <Stages offer={offer} />
                          </div>
                        </div>
                      ))}
                      {!hasNextPage ? null : (
                        <button
                          children={
                            networkStatus === 3
                              ? fbt('Loading...', 'Sale.loading')
                              : fbt('Load more', 'Sales.loadMode')
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
