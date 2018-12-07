import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class VerifierServices extends Component {
  render() {
    const { published, provisional, handleToggle } = this.props
    return (
      <div className="services-container">
        <p className="credit d-none d-md-flex">
          <FormattedMessage
            id={'_Services.poweredBy'}
            defaultMessage={'Powered by'}
          />{' '}
          <span className="logo d-none d-md-block">
            Origin<sup>ID</sup>
          </span>
        </p>
        <p className="directive d-none d-md-block">
          <FormattedMessage
            id={'_Services.pleaseConnectAccounts'}
            defaultMessage={
              'Please connect your accounts below to strengthen your identity on Origin.'
            }
          />
        </p>
        <div className="row no-gutters">
          <div className="col-6 col-md-4 attestation-button">
            <button
              data-modal="phone"
              className={`service d-flex${
                published.phone
                  ? ' published'
                  : provisional.phone
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/phone-icon-light.svg" alt="phone icon" />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.phone'}
                  defaultMessage={'Phone'}
                />
              </span>
            </button>
          </div>
          <div className="col-6 col-md-4 attestation-button">
            <button
              data-modal="email"
              className={`service d-flex${
                published.email
                  ? ' published'
                  : provisional.email
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/email-icon-light.svg" alt="email icon" />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.email'}
                  defaultMessage={'Email'}
                />
              </span>
            </button>
          </div>
          <div className="col-6 col-md-4 attestation-button">
            <button
              data-modal="airbnb"
              className={`service d-flex${
                published.airbnb
                  ? ' published'
                  : provisional.airbnb
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/airbnb-icon-light.svg" alt="Airbnb icon" />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.airbnb'}
                  defaultMessage={'Airbnb'}
                />
              </span>
            </button>
          </div>
          <div className="col-6 col-md-4 attestation-button">
            <button
              data-modal="facebook"
              className={`service d-flex${
                published.facebook
                  ? ' published'
                  : provisional.facebook
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/facebook-icon-light.svg" alt="Facebook icon" />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.facebook'}
                  defaultMessage={'Facebook'}
                />
              </span>
            </button>
          </div>
          <div className="col-6 col-md-4 attestation-button">
            <button
              data-modal="twitter"
              className={`service d-flex${
                published.twitter
                  ? ' published'
                  : provisional.twitter
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/twitter-icon-light.svg" alt="Twitter icon" />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.twitter'}
                  defaultMessage={'Twitter'}
                />
              </span>
            </button>
          </div>
          <div className="col-6 col-md-4 attestation-button">
            <button className="service d-flex disabled" disabled>
              <span className="image-container d-flex align-items-center justify-content-center">
                <img src="images/google-icon.svg" alt="Google icon" />
              </span>
              <span className="unavailable-bg" />
              <span className="unavailable-message">
                <FormattedMessage
                  id={'_Services.comingSoon'}
                  defaultMessage={'Coming {br} Soon'}
                  values={{ br: <br /> }}
                />
              </span>
              <span className="service-name">
                <FormattedMessage
                  id={'_Services.google'}
                  defaultMessage={'Google'}
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default VerifierServices
