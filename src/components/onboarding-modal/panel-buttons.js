import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

export default class PanelButtons extends Component {
  constructor(props) {
    super(props)

    this.connectMetaMask = this.connectMetaMask.bind(this)
    this.completeOnboarding = this.completeOnboarding.bind(this)
  }

  connectMetaMask() {
    this.props.displayNextStep()
  }

  completeOnboarding() {
    const { displayNextStep, closeModal } = this.props
    const stepsCompleted = true

    displayNextStep(stepsCompleted)
    closeModal()
  }

  render() {
    const { displayNextStep, step } = this.props
    const hasWallet = true
    const buttons = {
      Overview: hasWallet ? (
        <button className="btn btn-primary" onClick={() => displayNextStep()}>
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
            ga-label="step_1_install_metamask"
          >
            <FormattedMessage
              id={'onboarding-buttons.installMetaMask'}
              defaultMessage={'Install MetaMask'}
            />
          </a>
          <a
            href="#"
            className="d-block"
            onClick={() => displayNextStep()}
            ga-category="seller_onboarding"
            ga-label="step_1_skip"
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
          <Link
            to="/profile"
            target="_blank"
            ga-category="seller_onboarding"
            ga-label="step_2_verify"
          >
            <button key={'first-btn'} className="btn btn-primary">
              <FormattedMessage
                id={'onboarding-buttons.verify'}
                defaultMessage={'Verify'}
              />
            </button>
          </Link>
          <a
            href="#"
            onClick={() => displayNextStep()}
            ga-category="seller_onboarding"
            ga-label="step_2_skip"
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
            onClick={this.completeOnboarding}
            ga-category="seller_onboarding"
            ga-label="step_3_learn_more"
          >
            <button key={'first-btn'} className="btn btn-primary">
              <FormattedMessage
                id={'onboarding-buttons.getOriginTokens'}
                defaultMessage={'Learn more'}
              />
            </button>
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
