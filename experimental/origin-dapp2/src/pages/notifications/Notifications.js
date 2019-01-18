import React, { Component } from 'react'
import { Query } from 'react-apollo'
// import dayjs from 'dayjs'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import Link from 'components/Link'
import BottomScrollListener from 'components/BottomScrollListener'
import NavLink from 'components/NavLink'
import QueryError from 'components/QueryError'
import Avatar from 'components/Avatar'
import Redirect from 'components/Redirect'

import distanceToNow from 'utils/distanceToNow'
import nextPageFactory from 'utils/nextPageFactory'
import query from 'queries/UserNotifications'

const nextPage = nextPageFactory('marketplace.user.notifications')

const Row = ({ node, identity, onClick }) => {
  const name = get(
    identity,
    'profile.fullName',
    get(node, 'party.id').substr(0, 6)
  )
  const title = <b>{get(node, 'offer.listing.title')}</b>
  const event = get(node, 'event.event')
  let description = `${name} ${event} ${title}`
  const nameLink = <Link to={`/user/${get(node, 'party.id')}`}>{name}</Link>

  if (event === 'OfferWithdrawn') {
    description = (
      <>
        {nameLink}
        {` declined your offer on `}
        {title}
      </>
    )
  } else if (event === 'OfferAccepted') {
    description = (
      <>
        {nameLink}
        {` accepted your offer on `}
        {title}
      </>
    )
  } else if (event === 'OfferFinalized') {
    description = (
      <>
        {`Transaction with `}
        {nameLink}
        {` finalized for `}
        {title}
      </>
    )
  } else if (event === 'OfferCreated') {
    description = (
      <>
        {nameLink}
        {` made an offer on `}
        {title}
      </>
    )
  }

  return (
    <div onClick={() => onClick()}>
      <div>
        <Avatar avatar={get(identity, 'profile.avatar')} />
      </div>
      <div>
        <div>{description}</div>
        <div>{get(node, 'event.transactionHash')}</div>
      </div>
      <div>{distanceToNow(get(node, 'event.timestamp'))}</div>
      <div className="caret" />
    </div>
  )
}

const RowWithIdentity = withIdentity(Row)

class Notifications extends Component {
  state = {}
  render() {
    if (this.state.redirect) {
      const to = `/purchases/${this.state.redirect.offer.id}`
      return <Redirect to={to} push />
    }
    const vars = { first: 15, id: this.props.wallet }
    if (!this.props.wallet) return null

    return (
      <div className="container purchases">
        <Query
          query={query}
          variables={vars}
          notifyOnNetworkStatusChange={true}
        >
          {({ error, data, fetchMore, networkStatus }) => {
            if (networkStatus === 1) {
              return <h1>Loading...</h1>
            } else if (error) {
              return <QueryError error={error} query={query} vars={vars} />
            } else if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }

            const { nodes, pageInfo, totalCount } = get(
              data,
              'marketplace.user.notifications'
            )
            const { hasNextPage, endCursor: after } = pageInfo

            if (!totalCount) {
              return <NoNotifications />
            }

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <h1>{`${totalCount} Notifications`}</h1>
                  <div className="row">
                    <div className="col-md-3">
                      <ul className="nav nav-pills flex-column">
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/notifications"
                            exact
                          >
                            Unread
                          </NavLink>
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/notifications/all"
                            children="All"
                          />
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/notifications/buy"
                            children="Buy"
                          />
                        </li>
                        <li className="nav-item">
                          <NavLink
                            className="nav-link"
                            to="/notifications/sell"
                            children="Sell"
                          />
                        </li>
                      </ul>
                    </div>
                    <div className="col-md-9">
                      <div className="notifications-page">
                        {nodes.map(node => (
                          <RowWithIdentity
                            key={node.id}
                            node={node}
                            wallet={get(node, 'party.id')}
                            onClick={() => this.setState({ redirect: node })}
                          />
                        ))}
                      </div>
                      {!hasNextPage ? null : (
                        <button
                          text={
                            networkStatus === 3 ? 'Loading' : 'Load more...'
                          }
                          className="mt-3"
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

const NoNotifications = () => (
  <div className="row">
    <div className="col-12 text-center">
      <img src="images/empty-listings-graphic.svg" />
      <h1>You don&apos;t have any notifications.</h1>
      <p>Click below to view all listings.</p>
      <br />
      <Link to="/" className="btn btn-lg btn-primary btn-rounded">
        Browse Listings
      </Link>
    </div>
  </div>
)

export default withWallet(Notifications)

require('react-styl')(`
  .notifications-page
    border: 1px solid var(--light)
    border-radius: 5px
    > div
      display: flex
      cursor: pointer
      font-size: 18px
      font-weight: normal
      border-bottom: 1px solid var(--light)
      padding: 0.75rem
      &:hover
        background: var(--pale-grey-eight)
      > div:nth-child(1)
        width: 50px
        height: 50px
        margin-right: 1rem
      > div:nth-child(2)
        flex: 1
        min-width: 0
        > div:nth-child(2)
          overflow: hidden
          text-overflow: ellipsis
          font-size: 14px
          color: var(--steel)
      > div:nth-child(3)
        color: var(--steel)
        font-size: 14px
      &:last-child
        border: 0
      a
        font-weight: bold
      .caret
        border: 1px solid var(--clear-blue)
        border-radius: 2rem
        width: 1.75rem
        height: 1.75rem
        margin-left: 1rem
        background: url(images/caret-blue.svg) no-repeat center 7px
        transform: rotate(90deg)
        background-size: 12px;
`)
