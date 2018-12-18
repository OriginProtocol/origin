import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import NotificationsQuery from 'queries/Notifications'
import NotificationsSubscription from 'queries/NotificationsSubscription'

import Dropdown from 'components/Dropdown'

function subscribeToNewNotifications(subscribeToMore) {
  subscribeToMore({
    document: NotificationsSubscription,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) return prev

      const newNotification = subscriptionData.data.newNotification
      return Object.assign({}, prev, {
        notifications: {
          ...prev.notifications,
          nodes: [newNotification.node, ...prev.notifications.nodes],
          totalCount: newNotification.totalCount,
          totalUnread: newNotification.totalUnread
        }
      })
    }
  })
}

class NotificationsNav extends Component {
  render() {
    return (
      <Query query={NotificationsQuery}>
        {({ subscribeToMore, ...result }) => {
          if (result.loading || result.error) return null
          if (!get(result, 'data.web3.metaMaskAccount.id')) {
            return null
          }

          return (
            <NotificationsDropdown
              {...this.props}
              {...result}
              subscribeToNewNotifications={() =>
                subscribeToNewNotifications(subscribeToMore)
              }
            />
          )
        }}
      </Query>
    )
  }
}

class NotificationsDropdown extends Component {
  componentDidMount() {
    this.props.subscribeToNewNotifications()
  }

  componentDidUpdate(prevProps) {
    const unread = get(this.props, 'data.notifications.totalUnread', 0),
      prevUnread = get(prevProps, 'data.notifications.totalUnread', 0)

    if (unread > prevUnread && !prevProps.open) {
      this.props.onOpen()
    }
  }
  render() {
    const { data, loading, error, open, onOpen, onClose } = this.props

    if (loading || error) return null
    if (!data || !data.notifications) {
      return null
    }
    const hasUnread = data.notifications.totalUnread > 0 ? ' active' : ''

    return (
      <Dropdown
        el="li"
        className="nav-item notifications"
        open={open}
        onClose={() => onClose()}
        content={<NotificationsContent {...data.notifications} />}
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

const NotificationsContent = ({ totalCount, nodes }) => {
  const title = `Notification${totalCount === 1 ? '' : 's'}`
  return (
    <div className="dropdown-menu dropdown-menu-right show">
      <div className="count">
        <div className="total">{totalCount}</div>
        <div className="title">{title}</div>
      </div>
      {nodes.map(node => (
        <div key={node.id} className="notification">
          <div className="avatar" />
          <div className="detail">
            <div className="title">
              {node.title}
              <span>{node.timestamp}</span>
            </div>
            <div className="description">{node.content}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NotificationsNav

require('react-styl')(`
  .notifications
    .count
      display: flex;
      align-items: center
      padding: 0.85rem 1.25rem;
      font-size: 18px;
      font-weight: bold
      border-bottom: 1px solid var(--light)
      .total
        background: var(--greenblue);
        color: var(--white);
        width: 1.6rem;
        height: 1.6rem;
        border-radius: 2rem;
        line-height: 1.6rem;
        text-align: center;
      .title
        margin-left: 1.1rem
    .notification
      width: 540px
      background: var(--pale-grey-three)
      padding: 0.75rem 1rem
      display: flex
      align-items: center
      border-bottom: 1px solid var(--light)
      .avatar
        background: var(--dark-grey-blue) url(images/avatar-blue.svg) no-repeat center bottom;
        background-size: 1.5rem;
        width: 2.5rem;
        height: 2.5rem;
        margin-right: 1rem
        border-radius: 0.5rem
      .detail
        flex: 1
        .title
          display: flex
          align-items: center;
          justify-content: space-between;
          span
            font-size: 12px
            color: var(--bluey-grey)
        .description
          color: var(--steel)
          font-size: 12px
      &:last-child
        border-radius: 0 0 5px 5px
        border-bottom: 0

  .nav-item
    .notifications-icon
      width: 2.2rem
      height: 1.6rem
      background: url(images/alerts-icon.svg) no-repeat center
      background-size: contain
      position:relative
      &.active
        &::after
          content: "";
          width: 14px;
          height: 14px;
          background: var(--greenblue);
          border-radius: 10px;
          border: 2px solid var(--dusk);
          position: absolute;
          top: 0;
          right: 2px;

    &.show .notifications-icon
      background-image: url(images/alerts-icon-selected.svg)
      &.active::after
        border-color: white
`)
