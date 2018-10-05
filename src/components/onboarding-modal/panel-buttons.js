import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

export default class PanelButtons extends Component {
  constructor(props) {
    super(props)

    this.connectMetaMask = this.connectMetaMask.bind(this)
  }

  connectMetaMask() {
    this.props.displayNextStep()
  }

  render() {
    const { displayNextStep, step } = this.props
    const hasWallet = true
    const buttons = {
      Overview: hasWallet ? (
        <button className="btn btn-primary" onClick={displayNextStep}>
          <FormattedMessage
            id={'onboarding-buttons.next'}
            defaultMessage={'Next'}
          />
        </button>
      ) : (
        <Fragment>
          <a
            href="https://metamask.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            ga-category="seller_onboarding"
            ga-label="install_metamask_cta"
          >
            <FormattedMessage
              id={'onboarding-buttons.installMetaMask'}
              defaultMessage={'Install MetaMask'}
            />
          </a>
          <a
            href="#"
            className="d-block"
            onClick={displayNextStep}
            ga-category="seller_onboarding"
            ga-label="skip_install_metamask"
          >
            <FormattedMessage
              id={'onboarding-buttons.skip'}
              defaultMessage={'Skip'}
            />
          </a>
        </Fragment>
      ),
      Identity: (
        <div className="d-flex flex-column align-items-center">
          {/* [micah] can't get this work with <Link> */}
          <a
            href="/#/profile?skip-onboarding=true"
            target="_blank"
            ga-category="seller_onboarding"
            ga-label="verify_profile"
            className="btn btn-primary"
            onClick={displayNextStep}
          >
            <FormattedMessage
              id={'onboarding-buttons.verify'}
              defaultMessage={'Verify'}
            />
          </a>
          <a
            href="#"
            onClick={displayNextStep}
            ga-category="seller_onboarding"
            ga-label="skip_verify_profile"
          >
            <FormattedMessage
              id={'onboarding-buttons.skip'}
              defaultMessage={'Skip'}
            />
          </a>
        </div>
      ),
      'Origin Tokens': (
        <div className="col-auto">
          <Link
            to="/about-tokens"
            target="_blank"
            ga-category="seller_onboarding"
            ga-label="learn_more_cta"
            className="btn btn-primary"
            onClick={displayNextStep}
          >
            <FormattedMessage
              id={'onboarding-buttons.getOriginTokens'}
              defaultMessage={'Learn more'}
            />
          </Link>
        </div>
      )
    }
    const {
      name: {
        props: { defaultMessage }
      }
    } = step

    return <div className="panel-buttons"> {buttons[defaultMessage]} </div>
  }
}
