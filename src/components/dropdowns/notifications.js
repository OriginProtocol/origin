import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import { dismissNotifications } from 'actions/App'

import Notification from 'components/notification'

class NotificationsDropdown extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
  }

  componentDidMount() {
    // control hiding of dropdown menu
    $('.notifications.dropdown').on('hide.bs.dropdown', function({ clickEvent }) {
      // if triggered by data-toggle
      if (!clickEvent) {
        return true
      }
      // otherwise only if triggered by self or another dropdown
      const el = $(clickEvent.target)

      return el.hasClass('dropdown') && el.hasClass('nav-item')
    })

    $('.notifications.dropdown').on('hide.bs.dropdown', () => {
      const notificationsIds = this.props.notifications.map(n => n.id)

      this.props.dismissNotifications(notificationsIds)
    })
  }

  componentDidUpdate() {
    const { history, notifications, notificationsDismissed } = this.props
    const isOnNotificationsRoute = !!history.location.pathname.match(
      /^\/notifications/
    )
    const hasNewUnreadNotification = notifications.find(
      n => !notificationsDismissed.includes(n.id)
    )
    const dropdownHidden = !$('.notifications.dropdown').hasClass('show')

    if (!isOnNotificationsRoute && hasNewUnreadNotification && dropdownHidden) {
      $('#notificationsDropdown').dropdown('toggle')
    }
  }

  handleClick() {
    $('#notificationsDropdown').dropdown('toggle')
  }

  render() {
    const { notifications } = this.props
    // avoid integers greater than two digits
    const notificationCount =
      notifications.length < 100
        ? Number(notifications.length).toLocaleString()
        : `${Number(99).toLocaleString()}+`

    return (
      <div className="nav-item notifications dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="notificationsDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="notifications"
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
          className="dropdown-menu dropdown-menu-right"
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
                  />
                ))}
              </ul>
            </div>
            <Link to="/notifications" onClick={this.handleClick}>
              <footer>
                <FormattedMessage
                  id={'notificationsDropdown.viewAll'}
                  defaultMessage={'View All'}
                />
              </footer>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, notifications }) => {
  return {
    // add perspective and filter
    notifications: notifications
      .map(n => {
        const { seller } = n.resources.listing

        return {
          ...n,
          perspective: app.web3.account === seller ? 'seller' : 'buyer'
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
