import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class PurchaseProgress extends Component {
  constructor(props) {
    super(props)

    this.state = {
      currentStep: props.currentStep,
      maxStep: props.maxStep,
      progressCalculated: true,
      progressWidth: '0%'
    }
  }

  render() {
    const { perspective, subdued, currentStep, maxStep } = this.props
    const { progressCalculated } = this.state
    const progressWidth =
      currentStep > 1
        ? `${((currentStep - 1) / (maxStep - 1)) * 100}%`
        : `${currentStep * 10}px`

    // timestamps not yet available
    const soldAt = !!currentStep
    const fulfilledAt = currentStep > 1
    const receivedAt = currentStep > 2
    const withdrawnAt = currentStep > 3

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
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={
                null /*`Sent by seller on<br /><strong>${moment(fulfilledAt).format('MMM D, YYYY')}</strong>`*/
              }
            />
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
        {!subdued &&
          perspective === 'buyer' && (
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.purchased'}
                  defaultMessage={'Purchased'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.sentBySeller'}
                  defaultMessage={'Sent by seller'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.receivedByMe'}
                  defaultMessage={'Received by me'}
                />
              </div>
            </div>
          </div>
        )}
        {!subdued &&
          perspective === 'seller' && (
          <div className="labels d-flex justify-content-between text-center">
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.sold'}
                  defaultMessage={'Sold'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.orderSent'}
                  defaultMessage={'Order Sent'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.receivedByBuyer'}
                  defaultMessage={'Received by buyer'}
                />
              </div>
            </div>
            <div className="stage-container">
              <div className="stage">
                <FormattedMessage
                  id={'purchase-progress.fundsWithdrawn'}
                  defaultMessage={'Funds Withdrawn'}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default PurchaseProgress
