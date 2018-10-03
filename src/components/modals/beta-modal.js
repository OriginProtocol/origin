import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { dismissBetaModal } from 'actions/App'

import Modal from 'components/modal'

class BetaModal extends Component {
  render() {
    return (
      <Modal backdrop="static" isOpen={this.props.showModal} data-modal="beta">
        <div className="image-container">
          <img src="images/beta.svg" role="presentation" />
        </div>
        <div className="disclaimer m-auto">
          <h3>
            <FormattedMessage
              id={'beta-modal.message1'}
              defaultMessage={`Welcome to Origin's decentralized app! Please use at your own risk while we fix bugs and get our contracts audited.`}
            />
          </h3>
          <div className="d-flex flex-column text-left">
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message2'}
                defaultMessage={`Transactions use real ETH. Take offers to buy/sell seriously.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message3'}
                defaultMessage={`Use caution with counterparties you don't know. Please verify your own identity.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message4'}
                defaultMessage={`Check back often for status updates. There are currently no push/email notifications.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message5'}
                defaultMessage={`Disputes for escrowed funds are resolved by Origin's arbitration team.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message6'}
                defaultMessage={`No insurance is currently offered on any listings.`}
              />
            </div>
          </div>
        </div>
        <div className="button-container">
          <button
            className="btn btn-clear"
            onClick={this.props.dismiss}
            ga-category="beta"
            ga-label="dismiss_modal"
          >
            <FormattedMessage
              id={'beta-modal.proceed'}
              defaultMessage={'Proceed'}
            />
          </button>
        </div>
      </Modal>
    )
  }
}

const mapStateToProps = state => ({
  showModal: !state.app.betaModalDismissed
})

const mapDispatchToProps = dispatch => ({
  dismiss: () => dispatch(dismissBetaModal())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BetaModal)
