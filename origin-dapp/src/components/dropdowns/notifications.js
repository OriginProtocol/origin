import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { dismissNotifications } from 'actions/App'

import Notification from 'components/notification'
import Dropdown from 'components/dropdown'

import { formattedAddress } from 'utils/user'

class NotificationsDropdown extends Component {
  constructor(props) {
    super(props)
    this.state = { open: false }
  }

  toggle(state) {
    const open = state === 'close' ? false : !this.state.open
    if (!open) {
      const notificationsIds = this.props.notifications.map(n => n.id)
      this.props.dismissNotifications(notificationsIds)
    }
    this.setState({ open })
  }

  componentDidUpdate() {
    const { history, notifications, notificationsDismissed } = this.props
    const isOnNotificationsRoute = !!history.location.pathname.match(
      /^\/notifications/
    )
    const hasNewUnread = notifications.find(
      n => !notificationsDismissed.includes(n.id)
    )
    if (!isOnNotificationsRoute && hasNewUnread && !this.state.forceOpen) {
      this.setState({ open: true, forceOpen: true })
    }
  }

  render() {
    const { notifications } = this.props
    const { open } = this.state
    // avoid integers greater than two digits
    const notificationCount =
      notifications.length < 100
        ? Number(notifications.length).toLocaleString()
        : `${Number(99).toLocaleString()}+`

    return (
      <Dropdown
        className="nav-item notifications"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link active dropdown-toggle"
          id="notificationsDropdown"
          role="button"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="notifications"
          onClick={() => this.toggle()}
        >
          {!!notifications.length && <div className="unread-indicator" />}
          <img
            src="images/alerts-icon.svg"
            className="notifications"
            alt="Notifications"
          />
          <img
            src="images/alerts-icon-selected.svg"
            className="notifications selected"
            alt="Notifications"
          />
        </a>
        <div
          className={`dropdown-menu dropdown-menu-right${open ? ' show' : ''}`}
          aria-labelledby="notificationsDropdown"
        >
          <div className="triangle-container d-flex justify-content-end">
            <div className="triangle" />
          </div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">{notificationCount}</div>
              </div>
              <h3>
                {notificationCount === 1 && (
                  <FormattedMessage
                    id={'notificationsDropdown.notificationHeading'}
                    defaultMessage={'Unread Notification'}
                  />
                )}
                {notificationCount !== 1 && (
                  <FormattedMessage
                    id={'notificationsDropdown.notificationsHeading'}
                    defaultMessage={'Unread Notifications'}
                  />
                )}
              </h3>
            </header>
            <div className="notifications-list">
              <ul className="list-group">
                {notifications.map(n => (
                  <Notification
                    key={`dropdown-notification:${n.id}`}
                    notification={n}
                    onClick={() => this.toggle('close')}
                  />
                ))}
              </ul>
            </div>
            <Link to="/notifications" onClick={() => this.toggle('close')}>
              <footer>
                <FormattedMessage
                  id={'notificationsDropdown.viewAll'}
                  defaultMessage={'View All'}
                />
              </footer>
            </Link>
          </div>
        </div>
      </Dropdown>
    )
  }
}

const mapStateToProps = ({ app, notifications, wallet }) => {
  return {
    // add perspective and filter
    notifications: notifications
      .map(n => {
        const { seller } = n.resources.listing

        return {
          ...n,
          perspective:
            formattedAddress(wallet.address) === formattedAddress(seller)
              ? 'seller'
              : 'buyer'
        }
      })
      .filter(n => n.status === 'unread'),
    notificationsDismissed: app.notificationsDismissed
  }
}

const mapDispatchToProps = dispatch => ({
  dismissNotifications: ids => dispatch(dismissNotifications(ids))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(NotificationsDropdown)
)
