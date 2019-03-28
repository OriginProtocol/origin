import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import query from 'queries/UserNotifications'

import Redirect from 'components/Redirect'
import Dropdown from 'components/Dropdown'
import Link from 'components/Link'
import NotificationRow from 'pages/notifications/NotificationRow'

class NotificationsNav extends Component {
  render() {
    const vars = { first: 5, id: this.props.wallet }
    const skip = !this.props.wallet || !this.props.open
    return (
      <Query query={query} variables={vars} skip={skip}>
        {({ data, loading, error }) => (
          <NotificationsDropdown
            {...this.props}
            data={data}
            error={error}
            loading={loading}
          />
        )}
      </Query>
    )
  }
}

class NotificationsDropdown extends Component {
  state = {}
  componentDidUpdate(prevProps) {
    const unread = get(this.props, 'data.notifications.totalUnread', 0),
      prevUnread = get(prevProps, 'data.notifications.totalUnread', 0)

    if (unread > prevUnread && !prevProps.open) {
      this.props.onOpen()
    }
    if (this.state.redirect) {
      this.setState({ redirect: false })
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={`/purchases/${this.state.redirect.offer.id}`} push />
    }

    const { data, open, onOpen, onClose, loading, error } = this.props

    const { nodes, totalCount } = get(
      data,
      'marketplace.user.notifications',
      {}
    )

    const hasUnread = '' //get(data, .notifications.totalUnread > 0 ? ' active' : ''

    let content
    if (error) {
      content = (
        <div className="dropdown-menu dropdown-menu-right show p-3">
          <fbt desc="nav.notifications.errorLoading">
            Error loading notifications
          </fbt>
        </div>
      )
    } else if (loading) {
      content = (
        <div className="dropdown-menu dropdown-menu-right show p-3">
          <fbt desc="nav.notifications.loading">Loading...</fbt>
        </div>
      )
    } else if (open) {
      content = (
        <NotificationsContent
          totalCount={totalCount}
          nodes={nodes}
          onClose={() => onClose()}
          onClick={node => {
            this.setState({ redirect: node })
            onClose()
          }}
        />
      )
    }

    return (
      <Dropdown
        el="li"
        className="nav-item notifications d-none d-md-flex"
        open={open}
        onClose={() => onClose()}
        content={content}
      >
        <a
          className="nav-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            open ? onClose() : onOpen()
          }}
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <div className={`notifications-icon${hasUnread}`} />
        </a>
      </Dropdown>
    )
  }
}

const NotificationsContent = ({ totalCount, nodes, onClose, onClick }) => {
  const title = fbt(
    fbt.plural('Notification', totalCount),
    'nav.notifications.title'
  )
  return (
    <div className="dropdown-menu dropdown-menu-right show">
      <div className="count">
        <div className="total">{totalCount}</div>
        <div className="title">{title}</div>
      </div>
      {nodes.map(node => (
        <NotificationRow
          key={node.id}
          node={node}
          onClick={() => onClick(node)}
        />
      ))}
      <Link to="/notifications" onClick={() => onClose()}>
        <fbt desc="nav.notification.viewAll">View All</fbt>
      </Link>
    </div>
  )
}

export default withWallet(NotificationsNav)

require('react-styl')(`
  .nav-item.notifications,
  .nav-item.messages
    .count
      display: flex
      white-space: nowrap
      align-items: center
      padding: 0.625rem 1.25rem
      font-size: 18px
      font-weight: bold
      border-bottom: 1px solid var(--light)
      .total
        background: var(--greenblue)
        color: var(--white)
        min-width: 1.6rem
        padding: 0 0.5rem
        height: 1.6rem
        border-radius: 2rem
        line-height: 1.6rem
        text-align: center
      .title
        margin-left: 1.1rem
    .dropdown-menu
      > a
        background: var(--pale-grey-two)
        font-size: 18px
        text-align: center
        padding: 0.5rem
        display: block
        border-radius: 0 0 5px 5px

  .nav-item.notifications
    .notification-row
      max-width: 540px

  .nav-item
    .notifications-icon
      width: 2.2rem
      height: 1.6rem
      background: url(images/alerts-icon.svg) no-repeat center
      background-size: contain
      position:relative
      &.active
        &::after
          content: ""
          width: 14px
          height: 14px
          background: var(--greenblue)
          border-radius: 10px
          border: 2px solid var(--dusk)
          position: absolute
          top: 0
          right: 2px

    &.show .notifications-icon
      background-image: url(images/alerts-icon-selected.svg)
      &.active::after
        border-color: white
`)
