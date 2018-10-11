import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import moment from 'moment'

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

    const offerCreated = purchase && purchase.event('OfferCreated')
    const offerWithdrawn = purchase && purchase.event('OfferWithdrawn')
    const offerAccepted = purchase && purchase.event('OfferAccepted')
    const offerDisputed = purchase && purchase.event('OfferDisputed')
    const offerRuling = purchase && purchase.event('OfferRuling')
    const offerFinalized = purchase && purchase.event('OfferFinalized')
    const offerData = purchase && purchase.event('OfferData')

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
          {!offerCreated && <span className="progress-circle" />}
          {offerCreated && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Offer made on<br /><strong>${moment(
                offerCreated.timestamp * 1000
              ).format('MMM D, YYYY')}</strong>`}
            />
          )}
          {!offerAccepted && !offerWithdrawn && <span className="progress-circle" />}
          {offerAccepted && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Offer accepted on<br /><strong>${moment(
                offerAccepted.timestamp * 1000
              ).format('MMM D, YYYY')}</strong>`}
            />
          )}
          {offerWithdrawn && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Offer accepted on<br /><strong>${moment(
                offerWithdrawn.timestamp * 1000
              ).format('MMM D, YYYY')}</strong>`}
            />
          )}
          {!offerFinalized &&
            !offerDisputed && <span className="progress-circle" />}
          {offerFinalized && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Sale completed on<br /><strong>${moment(
                offerFinalized.timestamp * 1000
              ).format('MMM D, YYYY')}</strong>`}
            />
          )}
          {perspective === 'seller' &&
            !offerDisputed &&
            !offerData && <span className="progress-circle" />}
          {perspective === 'seller' &&
            offerData && (
            <span
              className="progress-circle checked"
              data-toggle="tooltip"
              data-placement="top"
              data-html="true"
              title={`Sale reviewed on<br /><strong>${moment(
                offerData.timestamp * 1000
              ).format('MMM D, YYYY')}</strong>`}
            />
          )}
          {offerDisputed &&
            !offerRuling && (
            <Fragment>
              <span
                className="progress-circle exclaimed"
                data-toggle="tooltip"
                data-placement="top"
                data-html="true"
                title={`Dispute started on<br /><strong>${moment(
                  offerDisputed.timestamp * 1000
                ).format('MMM D, YYYY')}</strong>`}
              >
                {!subdued && '!'}
              </span>
              <span className="progress-circle" />
            </Fragment>
          )}
          {offerRuling && (
            <Fragment>
              <span
                className="progress-circle checked"
                data-toggle="tooltip"
                data-placement="top"
                data-html="true"
                title={`Dispute started on<br /><strong>${moment(
                  offerDisputed.timestamp * 1000
                ).format('MMM D, YYYY')}</strong>`}
              />
              <span
                className="progress-circle checked"
                data-toggle="tooltip"
                data-placement="top"
                data-html="true"
                title={`Ruling made on<br /><strong>${moment(
                  offerRuling.timestamp * 1000
                ).format('MMM D, YYYY')}</strong>`}
              />
            </Fragment>
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
            {!offerDisputed && (
              <div className="stage-container">
                <div className="stage">
                  <FormattedMessage
                    id={'purchase-progress.saleCompleted'}
                    defaultMessage={'Sale Completed'}
                  />
                </div>
              </div>
            )}
            {!offerDisputed &&
              perspective === 'seller' && (
              <div className="stage-container">
                <div className="stage">
                  <FormattedMessage
                    id={'purchase-progress.saleReviewed'}
                    defaultMessage={'Sale Reviewed'}
                  />
                </div>
              </div>
            )}
            {offerDisputed && (
              <Fragment>
                <div className="stage-container">
                  <div className="stage">
                    <FormattedMessage
                      id={'purchase-progress.disputedStarted'}
                      defaultMessage={'Dispute Started'}
                    />
                  </div>
                </div>
                <div className="stage-container">
                  <div className="stage">
                    <FormattedMessage
                      id={'purchase-progress.rulingMade'}
                      defaultMessage={'Ruling Made'}
                    />
                  </div>
                </div>
              </Fragment>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default PurchaseProgress
