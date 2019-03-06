import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { dismissBetaModal } from 'actions/App'

import Modal from 'components/modal'

class BetaModal extends Component {
  render() {
    let { title } = this.props.config

    if (!title) {
      title = 'Origin'
    }

    return (
      <Modal backdrop="static" className="beta" isOpen={this.props.showModal} data-modal="beta">
        <div className="image-container">
          <img src="images/beta.svg" role="presentation" />
        </div>
        <div className="disclaimer m-auto">
          <h3>
            <FormattedMessage
              id={'beta-modal.message1'}
              defaultMessage={`Welcome to {title} Beta! {title} is a decentralized marketplace that works a little differently than most apps.`}
              values={{ title }}
            />
          </h3>
          <div className="d-flex flex-column text-left">
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message2'}
                defaultMessage={`We're in Beta mode, but all transactions are real and use ETH.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <div>
                <FormattedMessage
                  id={'beta-modal.message3'}
                  defaultMessage={`Please {link} so other buyers and sellers know who you are.`}
                  values={{
                    link: (
                      <a href="#/profile" target="_blank" rel="noopener noreferrer">verify your identity</a>
                    )
                  }}
                />
              </div>
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <div>
                <FormattedMessage
                  id={'beta-modal.message4'}
                  defaultMessage={`Don't forget to {link} so you can communicate with other users. It's free.`}
                  values={{
                    link: (
                      <a href="#/messages" target="_blank" rel="noopener noreferrer">enable Origin Messaging</a>
                    )
                  }}
                />
              </div>
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <div>
                <FormattedMessage
                  id={'beta-modal.message5'}
                  defaultMessage={`If you have any questions or need to dispute a transaction, {link}.`}
                  values={{
                    link: (
                      <a href="mailto:support@originprotocol.com" target="_blank" rel="noopener noreferrer">let us know</a>
                    )
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="button-container">
          <button
            className="btn btn-clear"
            onClick={this.props.dismiss}
            ga-category="beta"
            ga-label="dismiss_beta_page_load_modal"
          >
            <FormattedMessage
              id={'beta-modal.proceed'}
              defaultMessage={'I got it.'}
            />
          </button>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  config: state.config,
  showModal: !state.app.betaModalDismissed
})

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(dismissBetaModal())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BetaModal)
