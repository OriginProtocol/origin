import React, { Component } from 'react'
import $ from 'jquery'

const leftPanelInfo = [
  { title: 'Overview', description: 'How to start selling on the Origin DApp' },
  { title: 'Connect Wallet', description: 'Connect your wallet to start selling' },
  { title: 'Get Origin Tokens', description: 'Connect your wallet to start selling' }
]

class OnboardingModal extends Component {
  constructor(props) {
    super(props)
    this.state = { currentPosition: 0 }
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

  changePosition(currentPosition) {
    this.setState({ currentPosition });
  }

  render() {
    const { currentPosition } = this.state;

    const selected = (p) => p === currentPosition ? 'selected' : '';

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
                { leftPanelInfo.map(({title, description}, i) => (
                  <div key={title}
                    className={`content ${selected(i)}`}
                    onClick={() => this.changePosition(i)}
                  >
                    <div className="oval rounded-circle"> </div>
                    <span>{title}</span>
                    <p className="text-muted">{description}</p>
                  </div>
                ))}
              </div>
              <div className="flex-column col-8 right-panel">
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
