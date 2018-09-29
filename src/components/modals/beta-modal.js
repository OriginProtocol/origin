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
          <h2>
            <FormattedMessage
              id={'beta-modal.message1'}
              defaultMessage={`Thanks for checking out Origin's Mainnet Beta.`}
            />
          </h2>
          <h3>
            <FormattedMessage
              id={'beta-modal.message2'}
              defaultMessage={`We're still actively developing the product. Please bear with us as we add new features and fix bugs.`}
            />
          </h3>
          <div className="d-flex flex-column text-left">
            <div className="item d-flex justify-content-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message3'}
                defaultMessage={`All transactions will use real Ether. Please take all offers to buy and sell seriously.`}
              />
            </div>
            <div className="item d-flex justify-content-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message4'}
                defaultMessage={`Use caution when transacting with unknown buyers and sellers. Don't forget to verify your own identity.`}
              />
            </div>
            <div className="item d-flex align-items-center">
              <img src="images/warning-icon.svg" role="presentation" />
              <FormattedMessage
                id={'beta-modal.message5'}
                defaultMessage={`Any disputes will be resolved by Origin's arbitration team. No insurance is offered on any listings.`}
              />
            </div>
          </div>
        </div>
        <div className="button-container">
          <button className="btn btn-clear" onClick={this.props.dismiss}>
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
