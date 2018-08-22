import React, { Component } from 'react'
import $ from 'jquery'

class OnboardingModal extends Component {
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

  render() {
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
                <div className="content">
                  <div className="oval rounded-circle"> </div>
                  <span>Overview</span>
                  <p className="text-muted">How to start selling on the Origin DApp</p>
                </div>
                <div className="content">
                  <div className="oval rounded-circle"> </div>
                  <span>Connect Wallet</span>
                  <p className="text-muted">Connect your wallet to start selling</p>
                </div>
                <div className="content">
                  <div className="oval rounded-circle"> </div>
                  <span>Get Origin Tokens</span>
                  <p className="text-muted">Connect your wallet to start selling</p>
                </div>
              </div>
              <div style={{backgroundColor: 'white'}} className="flex-column col-8 right-panel">

              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default OnboardingModal
