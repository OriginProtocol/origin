import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

/*
  This subcomponent turns structured notification objects into dom elements,
  which wrap an anchor if there is a relevant listing.
*/
class HumanReadableNotification extends Component {
  render() {
    const { className, notification } = this.props
    const { eventType, message, listingId, listingName } = notification
    const productLink = <Link to={`/listing/${listingId}`}>{listingName}</Link>
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
      <p className={className || ''}>{subject} {presPerf} {verb}</p>
    )
  }
}

class Notification extends Component {
  render() {
    const { notification } = this.props
    const { counterpartyAddress, counterpartyName, listingId, listingImageURL, listingName, perspective } = notification

    return (
      <li className="list-group-item d-flex align-items-stretch notification">
        <div className="image-container d-flex align-items-center justify-content-center">
          {!listingId && <img src="images/origin-icon-white.svg" alt="Origin zero" />}
          {listingId && !listingImageURL && <img src="images/origin-icon-white.svg" alt="Origin zero" />}
          {listingId && listingImageURL && <img src={listingImageURL} className="listing-related" alt={listingName} />}
        </div>
        <div className="content-container d-flex flex-column justify-content-between">
          <HumanReadableNotification notification={notification} className={`text-truncate${counterpartyAddress ? '' : ' no-counterparty'}`} />
          {counterpartyAddress && <p className="text-truncate"><strong>{perspective === 'buyer' ? 'Seller' : 'Buyer'}</strong>: <Link to={`/users/${counterpartyAddress}`}>{counterpartyName || 'Unnamed User'}</Link></p>}
          {counterpartyAddress && <p className="text-truncate text-muted">{counterpartyAddress}</p>}
        </div>
        <div className="link-container m-auto">
          <a href="https://app.zeplin.io/project/59fa2311bac7acbc8d953da9/screen/5aa878781720abc6447f2cd3?did=5ab93f6fa022c2b641639214" className="btn" target="_blank">
            <img src="images/carat-blue.svg" className="carat" alt="right carat" />
          </a>
        </div>
      </li>
    )
  }
}

export default Notification
