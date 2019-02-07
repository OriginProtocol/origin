import React, { Component } from 'react'
import { Query } from 'react-apollo'
import dayjs from 'dayjs'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'

import TokenPrice from 'components/TokenPrice'
import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'

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
      <div className="container purchases">
        <PageTitle>My Purchases</PageTitle>
        <Query
          query={query}
          variables={vars}
          notifyOnNetworkStatusChange={true}
          skip={!this.props.wallet}
        >
          {({ error, data, fetchMore, networkStatus }) => {
            if (networkStatus === 1 || !this.props.wallet) {
              return <div>Loading...</div>
            } else if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }

            const { nodes, pageInfo, totalCount } = data.marketplace.user.offers
            const { hasNextPage, endCursor: after } = pageInfo

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <h1>My Purchases</h1>
                  <div className="row">
                    <div className="col-md-3">
                      <ul className="nav nav-pills flex-column">
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/my-purchases"
                            exact
                          >
                            Pending
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/my-purchases/complete"
                          >
                            Complete
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink className="nav-link" to="/my-purchases/all">
                            All
                          </NavLink>
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-9">
                      {totalCount > 0 ? null : <NoPurchases />}
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
  .purchases
    padding-top: 3rem
    .nav-pills .nav-link
      color: var(--dark-grey-blue)
      &.active
        background-color: var(--dark-grey-blue)
        color: var(--white)
    .purchase
      border: 1px solid var(--pale-grey-two);
      border-radius: 5px;
      padding: 0.5rem;
      display: flex
      margin-bottom: 1rem
      .main-pic
        width: 360px
        margin-right: 1rem
        background-size: contain
        background-repeat: no-repeat
        height: 260px
      .details
        flex: 1
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
`)
