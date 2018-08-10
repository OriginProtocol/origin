import React, { Component } from 'react'
import moment from 'moment'
import { FormattedMessage } from 'react-intl'

class PurchaseProgress extends Component {
  constructor(props) {
    super(props)

    this.calculateProgress = this.calculateProgress.bind(this)
    this.state = {
      currentStep: props.currentStep,
      maxStep: props.maxStep,
      progressCalculated: false,
      progressWidth: '0%',
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.deriveCurrentStep()
    this.deriveMaxStep()
    this.calculateProgress()
  }

  calculateProgress() {
    const { currentStep, maxStep } = this.state
    const progressWidth = currentStep > 1 ? `${(currentStep - 1) / (maxStep - 1) * 100}%` : `${currentStep * 10}px`

    if (this.state.progressWidth !== progressWidth) {
      this.setState({ progressCalculated: true, progressWidth })
    }
  }

  deriveMaxStep() {
    const { maxStep, perspective } = this.props
    let step = typeof maxStep === 'number' ? maxStep : perspective === 'seller' ? 4 : 3

    if (this.state.maxStep !== step) {
      this.setState({ maxStep: step })
    }
  }

  deriveCurrentStep() {
    const { currentStep, perspective, purchase } = this.props

    if (
      typeof currentStep === Number &&
      currentStep !== this.state.currentStep
    ) {
      return this.setState({ currentStep })
    }

    let step

    if (purchase.stage === 'complete') {
      step = this.state.maxStep
    } else if (purchase.stage === 'seller_pending') {
      step = 3
    } else if (purchase.stage === 'buyer_pending') {
      step = 2
    } else if (purchase.stage === 'in_escrow') {
      step = 1
    } else {
      step = 0
    }

    if (this.state.currentStep !== step) {
      this.setState({ currentStep: step })
    }
  }
  
  render() {
    const { perspective, purchase, subdued } = this.props
    const { currentStep, maxStep, progressCalculated, progressWidth } = this.state

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
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.purchased' }
                  defaultMessage={ 'Purchased' }
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.sentBySeller' }
                  defaultMessage={ 'Sent by seller' }
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.receivedByMe' }
                  defaultMessage={ 'Received by me' }
                />
              </div>
            </div>
          </div>
        }
        {!subdued && perspective === 'seller' &&
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.sold' }
                  defaultMessage={ 'Sold' }
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.orderSent' }
                  defaultMessage={ 'Order Sent' }
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.receivedByBuyer' }
                  defaultMessage={ 'Received by buyer' }
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={ 'purchase-progress.fundsWithdrawn' }
                  defaultMessage={ 'Funds Withdrawn' }
                />
              </div>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default PurchaseProgress
