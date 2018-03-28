import React, { Component, Fragment } from 'react'
import moment from 'moment'

class ListingProgressCard extends Component {
  render() {
    const { listing, perspective } = this.props
    const { _id, active, category, createdAt, fulfilledAt, receivedAt, soldAt, title, withdrawnAt } = listing
    const status = active ? 'active' : 'inactive'
    const timestamp = (() => {
      let date
      let verb

      if (withdrawnAt) {
        date = withdrawnAt
        verb = 'Withdrawn'
      } else if (receivedAt) {
        date = receivedAt
        verb = 'Received'
      } else if (fulfilledAt) {
        date = fulfilledAt
        verb = 'Sent'
      } else if (soldAt) {
        date = soldAt
        verb = perspective === 'seller' ? 'Sold' : 'Purchased'
      } else {
        date = createdAt
        verb = 'Created'
      }

      return `${verb} on ${moment(date).format('MMMM D, YYYY')}`
    })()

    return (
      <div key={`my-${perspective === 'seller' ? 'listing' : 'purchase'}-${_id}`} className="my-listing card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="image-container">
            <img role="presentation" />
          </div>
          <div className="content-container d-flex flex-column">
            {perspective === 'seller' && <span className={`status ${status}`}>{status}</span>}
            <p className="category">{category}</p>
            <h2 className="title">{title}</h2>
            <div className="d-flex">
              <p className="price">$1,000{perspective === 'seller' && soldAt && <span className="sold-banner">Sold</span>}</p>
              <p className="timestamp">{timestamp}</p>
            </div>
            <div className="timeline">
              <div className="line">
                <div className={`circle${soldAt ? ' checked' : ''}`}></div>
                <div className={`circle${fulfilledAt ? ' checked' : ''}`}></div>
                <div className={`circle${receivedAt ? ' checked' : ''}`}></div>
                <div className={`circle${withdrawnAt ? ' checked' : ''}`}></div>
              </div>
              <div className={`line fill${fulfilledAt? ' s1' : ''}${receivedAt? ' s2' : ''}${withdrawnAt ? ' s3' : ''}`}></div>
              {perspective === 'buyer' &&
                <div className="labels d-flex">
                  <p className="text-left">Purchased</p>
                  <p className="text-center">Sent<br />by seller</p>
                  <p className="text-center">Received<br />by me</p>
                  <p className="text-right">Funds<br />Withdrawn</p>
                </div>
              }
              {perspective === 'seller' &&
                <div className="labels d-flex">
                  <p className="text-left">Sold</p>
                  <p className="text-center">Order<br />Sent</p>
                  <p className="text-center">Received<br />by buyer</p>
                  <p className="text-right">Funds<br />Withdrawn</p>
                </div>
              }
            </div>
            {perspective === 'buyer' &&
              <div className="actions d-flex">
                <div className="links-container">
                  <a onClick={() => alert('To Do')}>Open a Dispute</a>
                </div>
                {soldAt &&
                  <div className="button-container">
                    {soldAt && fulfilledAt && !receivedAt && <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>I've Received the Order</a>}
                  </div>
                }
              </div>
            }
            {perspective === 'seller' &&
              <div className="actions d-flex">
                <div className="links-container">
                  <a onClick={() => alert('To Do')}>Edit</a>
                  <a onClick={() => alert('To Do')}>Disable</a>
                  <a className="warning" onClick={() => alert('To Do')}>Delete</a>
                </div>
                {soldAt &&
                  <div className="button-container">
                    {soldAt && !fulfilledAt && <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Order Sent</a>}
                    {soldAt && fulfilledAt && receivedAt && <a className="btn btn-primary btn-sm" onClick={() => alert('To Do')}>Retreive Funds</a>}
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}

export default ListingProgressCard
