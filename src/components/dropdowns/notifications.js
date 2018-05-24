import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import Notification from 'components/notification'
import data from '../../data'

class NotificationsDropdown extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    // randomly select from three examples
    const exampleCounts = [4, 44, 444][Math.floor(Math.random() * 3)]
    // avoid integers greater than two digits
    const notificationCount = exampleCounts < 100 ? Number(exampleCounts).toLocaleString() : `${Number(99).toLocaleString()}+`

    return (
      <div className="nav-item notifications dropdown">
        <a className="nav-link active dropdown-toggle" id="notificationsDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <div className="unread-indicator"></div>
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
              <h3>Notifications</h3>
            </header>
            <div className="notifications-list">
              <ul className="list-group">
                {data.notifications.map(n => <Notification key={`navbar-notification-${n._id}`} notification={n} />)}
              </ul>
            </div>
            <footer>
              <Link to="/notifications">View All</Link>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

export default NotificationsDropdown
