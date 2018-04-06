import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

class HumanReadableNotification extends Component {
  render() {
    const { className, notification } = this.props
    const { counterpartyAddress, countpartyName, eventType, message, listingId, listingName } = notification
    const productLink = <Link to={`/listing/${listingId}`}>{listingName}</Link>
    const counterpartyLink = <Link to={`/users/${counterpartyAddress}`}>{countpartyName || 'Unnamed User'}</Link>
    let subject, presPerf, verb

    switch(eventType) {
      case 'soldAt':
        subject = productLink
        presPerf = 'has been'
        verb = 'purchased'
        break
      case 'fulfilledAt':
        subject = productLink
        presPerf = 'has been'
        verb = 'sent'
        break
      case 'receivedAt':
        subject = productLink
        presPerf = 'has been'
        verb = 'received'
        break
      case 'withdrawnAt':
        subject = <Fragment>Funds from {productLink}</Fragment>
        presPerf = 'have been'
        verb = 'withdrawn'
        break
      default:
        return <p className={className || ''}>{message}</p>
    }

    return (
      <p className={className || ''}>{subject} {presPerf} {verb} by {counterpartyLink}</p>
    )
  }
}

class Notification extends Component {
  render() {
    const { notification } = this.props
    const { counterpartyAddress, counterpartyName, eventType, perspective } = notification

    return (
      <li className="list-group-item d-flex notification">
        <div>
          <div className="avatar-container">
            {!counterpartyAddress && <img src="/images/origin-icon-white.svg" className="no-counterparty" alt="Origin zero" />}
            {counterpartyAddress && <img src={`/images/avatar-${counterpartyName ? 'blue' : 'anonymous'}.svg`} alt="avatar" />}
            {counterpartyAddress && <div className={`${perspective} circle`}></div>}
          </div>
        </div>
        <div className="content-container">
          <HumanReadableNotification notification={notification} className="text-truncate" />
          <p className="text-truncate text-muted">{counterpartyAddress}</p>
        </div>
        <div className="link-container ml-auto">
          <a href="https://app.zeplin.io/project/59fa2311bac7acbc8d953da9/screen/5aa878781720abc6447f2cd3?did=5ab93f6fa022c2b641639214" className="btn" target="_blank">
            <img src="/images/carat.svg" className="carat" alt="right carat" />
          </a>
        </div>
      </li>
    )
  }
}

export default Notification
