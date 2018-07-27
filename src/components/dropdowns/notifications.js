import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import Notification from 'components/notification'

import origin from '../../services/origin'

class NotificationsDropdown extends Component {
  constructor(props) {
    super(props)

    this.state = { notifications: [] }
  }

  async componentWillMount() {
    try {
      const notifications = await origin.notifications.all()

      this.setState({ notifications })
    } catch(e) {
      console.error(e)
    }
  }

  render() {
    const { web3Account } = this.props
    const { notifications } = this.state
    const notificationsWithPerspective = notifications.map(n => {
      const { sellerAddress } = n.resources.listing

      return { ...n, perspective: web3Account === sellerAddress ? 'seller' : 'buyer' }
    })
    const filteredNotifications = notificationsWithPerspective.filter(n => n.status === 'unread')
    // avoid integers greater than two digits
    const notificationCount = filteredNotifications.length < 100 ?
                              Number(filteredNotifications.length).toLocaleString() :
                              `${Number(99).toLocaleString()}+`

    return (
      <div className="nav-item notifications dropdown">
        <a className="nav-link active dropdown-toggle" id="notificationsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {!!filteredNotifications.length && <div className="unread-indicator"></div>}
          <img src="images/alerts-icon.svg" className="notifications" alt="Notifications" />
          <img src="images/alerts-icon-selected.svg" className="notifications selected" alt="Notifications" />
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="notificationsDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">{notificationCount}</div>
              </div>
              <h3>
                <FormattedMessage
                  id={ 'notificationsDropdown.notificationsHeading' }
                  defaultMessage={ 'Unread Notifications' }
                />
              </h3>
            </header>
            <div className="notifications-list">
              <ul className="list-group">
                {filteredNotifications.map(n => <Notification key={`dropdown-notification:${n.id}`} notification={n} />)}
              </ul>
            </div>
            <Link to="/notifications">
              <footer>
                <FormattedMessage
                  id={ 'notificationsDropdown.viewAll' }
                  defaultMessage={ 'View All' }
                />
              </footer>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
  }
}

export default connect(mapStateToProps)(NotificationsDropdown)
