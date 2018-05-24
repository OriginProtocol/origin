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

  componentDidUpdate(prevProps) {
    if (prevProps.currentStep !== this.props.currentStep) {
      this.calculateProgress()
    }
  }

  calculateProgress() {
    const { currentStep } = this.props
    const { maxStep } = this.state
    const progressWidth = currentStep > 1 ? `${(currentStep - 1) / (maxStep - 1) * 100}%` : `${currentStep * 10}px`

    this.setState({ progressCalculated: true, progressWidth })
  }
  
  render() {
    const { currentStep, perspective, purchase, subdued } = this.props
    const { maxStep, progressCalculated, progressWidth } = this.state

    // timestamps not yet available
    const soldAt = !!currentStep
    const fulfilledAt = currentStep > 1
    const receivedAt = currentStep > 2
    const withdrawnAt = currentStep > 3

    return (
      <div className={`progress-container${progressCalculated ? ' ready' : ''}${subdued ? ' subdued' : ''}`}>
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
              title={null/*`Sold on<br /><strong>${moment(soldAt).format('MMM D, YYYY')}</strong>`*/}>
            </span>
          }
          {!fulfilledAt && <span className="progress-circle"></span>}
          {fulfilledAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={null/*`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`*/}>
            </span>
          }
          {!receivedAt && <span className="progress-circle"></span>}
          {receivedAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={null/*`Received by buyer on<br /><strong>${moment(receivedAt).format('MMM D, YYYY')}</strong>`*/}>
            </span>
          }
          {perspective === 'seller' && !withdrawnAt && <span className="progress-circle"></span>}
          {perspective === 'seller' && withdrawnAt &&
            <span className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={null/*`Funds withdrawn on<br /><strong>${moment(withdrawnAt).format('MMM D, YYYY')}</strong>`*/}>
            </span>
          }
        </div>
        {!subdued && perspective === 'buyer' &&
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">Purchased</div>
            </div>
            <div className="stage-container">
              <div className="stage">Sent by seller</div>
            </div>
            <div className="stage-container">
              <div className="stage">Received by me</div>
            </div>
          </div>
        }
        {!subdued && perspective === 'seller' &&
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">Sold</div>
            </div>
            <div className="stage-container">
              <div className="stage">Order<br />Sent</div>
            </div>
            <div className="stage-container">
              <div className="stage">Received<br />by buyer</div>
            </div>
            <div className="stage-container">
              <div className="stage">Funds<br />Withdrawn</div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default TransactionProgress
