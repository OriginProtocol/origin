import React, { Component } from 'react'

class VerifierServices extends Component {
  render() {
    const { published, provisional, handleToggle } = this.props
    return (
      <div className="services-container">
        <p className="credit">
          Powered by{' '}
          <span className="logo">
            Origin<sup>ID</sup>
          </span>
        </p>
        <p className="directive">
          Please connect your accounts below to strengthen your identity on
          Origin.
        </p>
        <div className="row no-gutters">
          <div className="col-12 col-sm-6 col-md-4">
            <button
              data-modal="phone"
              className={`service${
                published.phone
                  ? ' published'
                  : provisional.phone
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex text-center justify-content-center">
                <img src="/images/phone-icon-light.svg" alt="phone icon" />
              </span>
              <p>Phone</p>
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <button
              data-modal="email"
              className={`service${
                published.email
                  ? ' published'
                  : provisional.email
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex text-center justify-content-center">
                <img src="/images/email-icon-light.svg" alt="email icon" />
              </span>
              <p>Email</p>
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <button className="service disabled" disabled>
              <span className="image-container d-flex text-center justify-content-center">
                <img src="/images/address-icon.svg" alt="address icon" />
              </span>
              <span className="unavailable-bg" />
              <span className="unavailable-message">
                Coming<br />Soon
              </span>
              <p>Address</p>
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <button
              data-modal="facebook"
              className={`service${
                published.facebook
                  ? ' published'
                  : provisional.facebook
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex text-center justify-content-center">
                <img
                  src="/images/facebook-icon-light.svg"
                  alt="Facebook icon"
                />
              </span>
              <p>Facebook</p>
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <button
              data-modal="twitter"
              className={`service${
                published.twitter
                  ? ' published'
                  : provisional.twitter
                    ? ' verified'
                    : ''
              }`}
              onClick={handleToggle}
            >
              <span className="image-container d-flex text-center justify-content-center">
                <img src="/images/twitter-icon-light.svg" alt="Twitter icon" />
              </span>
              <p>Twitter</p>
            </button>
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <button className="service disabled" disabled>
              <span className="image-container d-flex text-center justify-content-center">
                <img src="/images/google-icon.svg" alt="Google icon" />
              </span>
              <span className="unavailable-bg" />
              <span className="unavailable-message">
                Coming<br />Soon
              </span>
              <p>Google</p>
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default VerifierServices
