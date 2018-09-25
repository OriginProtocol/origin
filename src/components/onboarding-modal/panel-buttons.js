import React, { Component } from 'react'
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
    const buttons = {
      'Overview': (
        <button className="btn btn-primary" onClick={() => displayNextStep()}>
          <FormattedMessage
            id={'onboarding-buttons.overview'}
            defaultMessage={'Next'}
          />
        </button>
      ),
      'Connect Wallet': (
        <div className="d-flex flex-column align-items-center">
          <button
            key={'first-btn'}
            className="btn btn-primary btn-lg mb-3"
            onClick={() => displayNextStep()}
          >
            <FormattedMessage
              id={'onboarding-buttons.connectWalletOne'}
              defaultMessage={'Next'}
            />
          </button>
          {/*
          <button key={'sec-btn'} className="btn btn-primary btn-lg" disabled>
            <FormattedMessage
              id={'onboarding-buttons.connectWalletTwo'}
              defaultMessage={'Download Mobile Wallet'}
            />
          </button>
          */}
        </div>
      ),
      'Connected': (
        <button className="btn btn-primary" onClick={() => displayNextStep()}>
          <FormattedMessage
            id={'onboarding-buttons.connected'}
            defaultMessage={'Learn about Origin Tokens'}
          />
        </button>
      ),
      'Get Origin Tokens': (
        <div className="col-auto">
          <Link
            to="/about-tokens"
            target="_blank"
            onClick={this.completeOnboarding}
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
    const { name: { props: { defaultMessage } } } = step

    return <div className="panel-buttons"> {buttons[defaultMessage]} </div>
  }
}
