import React, { Component } from 'react'
import moment from 'moment'

class TransactionProgress extends Component {
  constructor(props) {
    super(props)

    this.calculateProgress = this.calculateProgress.bind(this)
    this.state = {
      maxStep: props.maxStep || (props.perspective === 'seller' ? 4 : 3),
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
    const { currentStep } = this.props
    const { maxStep } = this.state
    const progressWidth = currentStep > 1 ? `${(currentStep - 1) / (maxStep - 1) * 100}%` : `${currentStep * 10}px`

    this.setState({ progressCalculated: true, progressWidth })
  }
  render() {
    const { currentStep, listing, perspective } = this.props
    const { maxStep, progressCalculated, progressWidth } = this.state
    const { _id, fulfilledAt, receivedAt, soldAt, withdrawnAt } = listing

    return (
      <div className={`progress-container${progressCalculated ? ' ready' : ''}`}>
        <div className="progress">
          <div className="progress-bar" role="progressbar" style={{ width: progressWidth }} aria-valuenow={Math.max(maxStep, currentStep)} aria-valuemin="0" aria-valuemax={maxStep}></div>
        </div>
        <div className="circles d-flex justify-content-between">
          {!soldAt && <span className="progress-circle"></span>}
          {soldAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Sold on<br /><strong>${moment(soldAt).format('MMM D, YYYY')}</strong>`}>
            </span>
          }
          {!fulfilledAt && <span className="progress-circle"></span>}
          {fulfilledAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`}>
            </span>
          }
          {!receivedAt && <span className="progress-circle"></span>}
          {receivedAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Received by buyer on<br /><strong>${moment(receivedAt).format('MMM D, YYYY')}</strong>`}>
            </span>
          }
          {perspective === 'seller' && !withdrawnAt && <span className="progress-circle"></span>}
          {perspective === 'seller' && withdrawnAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Funds withdrawn on<br /><strong>${moment(withdrawnAt).format('MMM D, YYYY')}</strong>`}>
            </span>
          }
        </div>
        {perspective === 'buyer' &&
          <div className="labels d-flex justify-content-between text-center">
            <div><p>Purchased</p></div>
            <div><p>Sent by seller</p></div>
            <div><p>Received by me</p></div>
          </div>
        }
        {perspective === 'seller' &&
          <div className="labels d-flex justify-content-between text-center">
            <div><p>Sold</p></div>
            <div><p>Order<br />Sent</p></div>
            <div><p>Received<br />by buyer</p></div>
            <div><p>Funds<br />Withdrawn</p></div>
          </div>
        }
      </div>
    )
  }
}

export default TransactionProgress
