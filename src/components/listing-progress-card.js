import React, { Component } from 'react'
import moment from 'moment'

class ListingProgressCard extends Component {
  constructor(props) {
    super(props)

    this.calculateProgress = this.calculateProgress.bind(this)
    this.state = {
      currentStep: 0,
      maxStep: props.perspective === 'seller' ? 4 : 3,
      progressCalculated: false,
      progressWidth: '0%',
    }
  }

  componentDidMount() {
    setTimeout(() => {
      this.calculateProgress()
    }, 400)
  }

  calculateProgress() {
    const { listing, perspective } = this.props
    const { fulfilledAt, receivedAt, soldAt, withdrawnAt } = listing
    let { currentStep, maxStep } = this.state

    if (withdrawnAt) {
      currentStep = perspective === 'seller' ? 4 : 3
    } else if (receivedAt) {
      currentStep = 3
    } else if (fulfilledAt) {
      currentStep = 2
    } else if (soldAt) {
      currentStep = 1
    } else {
      currentStep = 0
    }

    const progressWidth = `${(currentStep - 1) / (maxStep - 1) * 100}%`

    this.setState({ currentStep, progressCalculated: true, progressWidth })
  }

  render() {
    const { listing, perspective } = this.props
    const { currentStep, maxStep, progressCalculated, progressWidth } = this.state
    const { active, category, createdAt, fulfilledAt, receivedAt, soldAt, title, withdrawnAt } = listing
    const status = active ? 'active' : 'inactive'
    let date, verb

    if (currentStep === 4) {
      date = withdrawnAt
      verb = 'Withdrawn'
    } else if (currentStep === 3) {
      date = receivedAt
      verb = 'Received'
    } else if (currentStep === 2) {
      date = fulfilledAt
      verb = 'Sent'
    } else if (currentStep === 1) {
      date = soldAt
      verb = perspective === 'seller' ? 'Sold' : 'Purchased'
    } else {
      date = createdAt
      verb = 'Created'
    }

    const timestamp = `${verb} on ${moment(date).format('MMMM D, YYYY')}`

    return (
      <div className={`my-listing card${progressCalculated ? ' ready' : ''}`}>
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="image-container">
            <img role="presentation" />
          </div>
          {perspective === 'buyer' &&
            <div className="content-container d-flex flex-column">
              <p className="category">{category}</p>
              <h2 className="title">{title}</h2>
              <div className="d-flex">
                <p className="price">$1,000</p>
                <p className="timestamp">{timestamp}</p>
              </div>
              <div className="progress-container">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ width: progressWidth }} aria-valuenow={Math.max(maxStep, currentStep)} aria-valuemin="0" aria-valuemax={maxStep}></div>
                </div>
                <span className={`circle${soldAt ? ' checked' : ''}`}></span>
                <span className={`circle${fulfilledAt ? ' checked' : ''}`}></span>
                <span className={`circle${receivedAt ? ' checked' : ''}`}></span>
                <div className="labels d-flex">
                  <p className="text-left">Purchased</p>
                  <p className="text-center">Sent by seller</p>
                  <p className="text-right">Received by me</p>
                </div>
              </div>
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
            </div>
          }
          {perspective === 'seller' &&
            <div className="content-container d-flex flex-column">
              <span className={`status ${status}`}>{status}</span>
              <p className="category">{category}</p>
              <h2 className="title">{title}</h2>
              <div className="d-flex">
                <p className="price">$1,000{soldAt && <span className="sold-banner">Sold</span>}</p>
                <p className="timestamp">{timestamp}</p>
              </div>
              <div className="progress-container">
                <div className="progress">
                  <div className="progress-bar" role="progressbar" style={{ width: progressWidth }} aria-valuenow={Math.max(maxStep, currentStep)} aria-valuemin="0" aria-valuemax={maxStep}></div>
                </div>
                <span className={`circle${soldAt ? ' checked' : ''}`}></span>
                <span className={`circle${fulfilledAt ? ' checked' : ''}`}></span>
                <span className={`circle${receivedAt ? ' checked' : ''}`}></span>
                <span className={`circle${withdrawnAt ? ' checked' : ''}`}></span>
                <div className="labels d-flex">
                  <p className="text-left">Sold</p>
                  <p className="text-center">Order<br />Sent</p>
                  <p className="text-center">Received<br />by buyer</p>
                  <p className="text-right">Funds<br />Withdrawn</p>
                </div>
              </div>
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
            </div>
          }
        </div>
      </div>
    )
  }
}

export default ListingProgressCard
