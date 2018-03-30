import React, { Component } from 'react'

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
          <span className={`progress-circle${soldAt ? ' checked' : ''}`}></span>
          <span className={`progress-circle${fulfilledAt ? ' checked' : ''}`}></span>
          <span className={`progress-circle${receivedAt ? ' checked' : ''}`}></span>
          {perspective === 'seller' && <span className={`progress-circle${withdrawnAt ? ' checked' : ''}`}></span>}
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
