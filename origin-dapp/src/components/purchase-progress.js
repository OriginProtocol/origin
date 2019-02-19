import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import moment from 'moment-timezone'

import Tooltip from 'components/tooltip'

import { formattedAddress } from 'utils/user'
import { getOfferEvents } from 'utils/offer'

const formatDate = timestamp => moment(timestamp * 1000).format('MMM D, YYYY')

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
    const offerEvents = getOfferEvents(purchase)

    const [
      offerCreated,
      offerWithdrawn,
      offerAccepted,
      offerDisputed,
      offerRuling,
      offerFinalized,
      offerData
    ] = offerEvents

    const withdrawnOrRejected = offerWithdrawn ? (
      formattedAddress(purchase.buyer) === offerWithdrawn.returnValues.party ? 'withdrawn' : 'rejected'
    ) : null

    return (
      <div
        className={`progress-container${progressCalculated ? ' ready' : ''}${
          subdued ? ' subdued' : ''
        } mt-auto mb-3`}
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
            <Tooltip
              placement="top"
              triggerClass="progress-circle checked"
              content={
                <Fragment>
                  <div>Offer made on</div>
                  <strong>{formatDate(offerCreated.timestamp)}</strong>
                </Fragment>
              }
              children={<span/>}
            />
          )}
          {!offerAccepted && !offerWithdrawn && (
            <span className="progress-circle" />
          )}
          {offerAccepted && (
            <Tooltip
              placement="top"
              triggerClass="progress-circle checked"
              content={
                <Fragment>
                  <div>Offer accepted on</div>
                  <strong>{formatDate(offerAccepted.timestamp)}</strong>
                </Fragment>
              }
              children={<span />}
            />
          )}
          {offerWithdrawn && (
            <Tooltip
              placement="top"
              triggerClass="progress-circle checked"
              content={
                <Fragment>
                  <div>Offer {withdrawnOrRejected} on</div>
                  <strong>{formatDate(offerWithdrawn.timestamp)}</strong>
                </Fragment>
              }
              children={<span />}
            />
          )}
          {!offerFinalized && !offerDisputed && (
            <span className="progress-circle" />
          )}
          {offerFinalized && (
            <Tooltip
              placement="top"
              triggerClass="progress-circle checked"
              content={
                <Fragment>
                  <div>Sale completed on</div>
                  <strong>{formatDate(offerFinalized.timestamp)}</strong>
                </Fragment>
              }
              children={<span />}
            />
          )}
          {perspective === 'seller' && !offerDisputed && !offerData && (
            <span className="progress-circle" />
          )}
          {perspective === 'seller' && offerData && (
            <Tooltip
              placement="top"
              triggerClass="progress-circle checked"
              content={
                <Fragment>
                  <div>Sale reviewed on</div>
                  <strong>{formatDate(offerData.timestamp)}</strong>
                </Fragment>
              }
              children={<span />}
            />
          )}
          {offerDisputed && !offerRuling && (
            <Fragment>
              <Tooltip
                placement="top"
                triggerClass="progress-circle exclaimed"
                content={
                  <Fragment>
                    <div>Dispute started on</div>
                    <strong>{formatDate(offerDisputed.timestamp)}</strong>
                  </Fragment>
                }
                children={
                  <span >
                    {subdued ? null : '!'}
                  </span>
                }
              />
              <span className="progress-circle" />
            </Fragment>
          )}
          {offerRuling && (
            <Fragment>
              <Tooltip
                placement="top"
                triggerClass="progress-circle checked"
                content={
                  <Fragment>
                    <div>Dispute started on</div>
                    <strong>{formatDate(offerDisputed.timestamp)}</strong>
                  </Fragment>
                }
                children={<span />}
              />
              <Tooltip
                placement="top"
                triggerClass="progress-circle checked"
                content={
                  <Fragment>
                    <div>Ruling made on</div>
                    <strong>{formatDate(offerRuling.timestamp)}</strong>
                  </Fragment>
                }
                children={<span />}
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
                {purchase.status === 'withdrawn' && withdrawnOrRejected === 'rejected' && (
                  <FormattedMessage
                    id={'purchase-progress.offerRejected'}
                    defaultMessage={'Offer Rejected'}
                  />
                )}
                {purchase.status === 'withdrawn' && withdrawnOrRejected === 'withdrawn' && (
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
            {!offerDisputed && perspective === 'seller' && (
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
