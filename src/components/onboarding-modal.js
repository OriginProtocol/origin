import React, { Component } from 'react'
import $ from 'jquery'

const steps = [
  {name: 'Overview', description: 'How to start selling on the Origin DApp', complete: false},
  {name: 'Connect Wallet', description: 'Connect your wallet to start selling', complete: false},
  {name: 'Get Origin Tokens', description: 'Connect your wallet to start selling', complete: false}
]

class OnboardingModal extends Component {
  constructor(props) {
    super(props)
    this.state = {steps, currentStep: 0}
  }

  componentDidMount() {
    this.$el = $(this.el)

    this.$el.modal({
      backdrop: this.props.backdrop || true,
      show: this.props.isOpen || true
    })
  }

  componentDidUpdate(prevProps) {
    const { isOpen=true } = this.props

    if (prevProps.isOpen !== isOpen) {
      this.$el.modal(isOpen ? 'show' : 'hide')
    }
  }

  componentWillUnmount() {
    this.$el.modal('hide')
  }

  changeStep(currentStep) {
    this.setState({ currentStep });
  }

  render() {
    const { currentStep } = this.state;

    const selected = (p) => p === currentStep ? 'selected' : '';

    return (
      <div
        ref={el => (this.el = el)}
        className={`modal fade`}
        tabIndex="-1"
        role="dialog"
        aria-hidden="true"
      >
        <div className="modal-dialog onboarding-modal">
          <div className="modal-content d-flex">
            <div className="row">
              <div className="flex-column col-4 text-left left-panel">
                { steps.map(({name, description}, i) => (
                  <div key={name}
                    className={`content ${selected(i)}`}
                    onClick={() => this.changeStep(i)}
                  >
                    <div className="oval rounded-circle"> </div>
                    <span>{name}</span>
                    <p className="text-muted">{description}</p>
                  </div>
                ))}
              </div>
              <div className="flex-column col-8 right-panel">
                <div className="text-right">
                  <img src="/images/close-icon.svg" alt="close-icon" />
                </div>
                <img src="/images/eth-tokens.svg" alt="eth-tokens" />
                <div>
                  <h3>Selling on the Origin DApp</h3>
                  <p>
                    In order to sell on the Origin DApp, you will need to connect
                    a wallet in order to accept payment in ETH
                  </p>
                  <p>
                    Payment for goods and services on the Origin DApp are always
                    made in ETH
                  </p>
                  <button className='btn btn-primary'>Connect a Wallet</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OnboardingModal
