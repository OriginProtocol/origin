import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class PurchaseProgress extends Component {
  constructor(props) {
    super(props)

    this.calculateProgress = this.calculateProgress.bind(this)

    this.state = {
      progressCalculated: false,
      progressWidth: '0%'
    }
  }

  componentDidMount() {
    // delay calculation to support CSS transition
    setTimeout(() => {
      this.calculateProgress()
    })
  }

  componentDidUpdate() {
    this.calculateProgress()
  }

  calculateProgress() {
    const { currentStep, maxStep } = this.props
    const progressWidth =
      currentStep > 1
        ? `${Math.min((currentStep - 1) / (maxStep - 1), 1) * 100}%`
        : `${currentStep * 10}px`

    if (this.state.progressWidth !== progressWidth) {
      this.setState({ progressCalculated: true, progressWidth })
    }
  }

  render() {
    const { currentStep, maxStep, perspective, purchase, subdued } = this.props
    const { progressCalculated, progressWidth } = this.state

    // timestamps not yet available
    const soldAt = !!currentStep
    const fulfilledAt = currentStep > 1
    const receivedAt = currentStep > 2
    const withdrawnAt = currentStep > 3
    const disputed = purchase && purchase.status === 'disputed'

    return (
      <div
        className={`progress-container${progressCalculated ? ' ready' : ''}${
          subdued ? ' subdued' : ''
        }`}
      >
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: progressWidth }}
            aria-valuenow={Math.max(maxStep, currentStep)}
            aria-valuemin="0"
            aria-valuemax={maxStep}
          />
        </div>
        <div className="circles d-flex justify-content-between">
          {!soldAt && <span className="progress-circle" />}
          {soldAt && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={
                null /*`Sold on<br /><strong>${moment(soldAt).format('MMM D, YYYY')}</strong>`*/
              }
            />
          )}
          {!fulfilledAt && <span className="progress-circle" />}
          {fulfilledAt && (
            <span
              className={`progress-circle ${disputed ? 'disputed' : 'checked'}`}
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={
                null /*`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`*/
              }
            >
              {disputed && '!'}
            </span>
          )}
          {!receivedAt && <span className="progress-circle" />}
          {receivedAt && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={
                null /*`Received by buyer on<br /><strong>${moment(receivedAt).format('MMM D, YYYY')}</strong>`*/
              }
            />
          )}
          {perspective === 'seller' &&
            !withdrawnAt && <span className="progress-circle" />}
          {perspective === 'seller' &&
            withdrawnAt && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={
                null /*`Funds withdrawn on<br /><strong>${moment(withdrawnAt).format('MMM D, YYYY')}</strong>`*/
              }
            />
          )}
        </div>
        {!subdued && (
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.offerMade'}
                  defaultMessage={'Offer Made'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                {purchase.status !== 'withdrawn' && (
                  <FormattedMessage
                    id={'purchase-progress.offerAccepted'}
                    defaultMessage={'Offer Accepted'}
                  />
                )}
                {purchase.status === 'withdrawn' && (
                  <FormattedMessage
                    id={'purchase-progress.offerWithdrawn'}
                    defaultMessage={'Offer Withdrawn'}
                  />
                )}
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.saleCompleted'}
                  defaultMessage={'Sale Completed'}
                />
              </div>
            </div>
            {perspective === 'seller' && (
              <div className="stage-container">
                <div className="stage">
                  <FormattedMessage
                    id={'purchase-progress.saleReviewed'}
                    defaultMessage={'Sale Reviewed'}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default PurchaseProgress
