import React, { Component } from 'react'
import Notification from './notification'
import data from '../data'

class Notifications extends Component {
  constructor(props) {
    super(props)

    this.state = { filter: 'unread' }
  }

  render() {
    const { filter } = this.state
    const notifications = filter === 'all' ? data.notifications : data.notifications.filter(n => {
      return filter === 'unread' ? !n.readAt : (n.perspective === filter)
    })

    return (
      <div className="notifications-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>Notifications</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-3">
              <div className="filters list-group flex-row flex-md-column">
                <a className={`list-group-item list-group-item-action${filter === 'unread' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'unread' })}>Unread</a>
                <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>All</a>
                <a className={`list-group-item list-group-item-action${filter === 'buyer' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'buyer' })}>Buy</a>
                <a className={`list-group-item list-group-item-action${filter === 'seller' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'seller' })}>Sell</a>
              </div>
            </div>
            <div className="col-12 col-md-9">
              <div className="notifications-list">
                <ul className="list-group">
                  {notifications.map(n => <Notification key={`notification-${n._id}`} notification={n} />)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Notifications
