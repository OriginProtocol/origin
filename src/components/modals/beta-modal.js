import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from 'components/modal'

class BetaModal extends Component {
  constructor(props) {
    super(props)

    this.handleToggle = this.handleToggle.bind(this)
    this.state = {
      isOpen: !JSON.parse(localStorage.getItem('betaModal.dismissed'))
    }
  }

  handleToggle() {
    this.setState({ isOpen: false })

    localStorage.setItem('betaModal.dismissed', true)
  }

  render() {
    return (
      <Modal backdrop="static" isOpen={this.state.isOpen} data-modal="beta">
        <div className="image-container">
          <img src="images/beta.svg" role="presentation" />
        </div>
        <h2>
          <FormattedMessage
            id={'beta-modal.heading'}
            defaultMessage={'Welcome to Origin.'}
          />
        </h2>
        <div className="disclaimer">
          <p>
            <FormattedMessage
              id={'beta-modal.message1'}
              defaultMessage={'Thanks for checking out our DApp.'}
            />
          </p>
          <p>
            <FormattedMessage
              id={'beta-modal.message2'}
              defaultMessage={
                "We're currently in Mainnet Beta. Feel free to poke around and have fun, but keep in mind that we’re still actively developing the product. Please bear with us as we work to add new features, fix bugs, and improve the experience."
              }
            />
          </p>
          <p>
            <FormattedMessage
              id={'beta-modal.message3'}
              defaultMessage={
                'All transactions will happen with real Ether. Please don’t buy or sell anything that you don’t intend to follow through on.'
              }
            />
          </p>
          <p>
            <FormattedMessage
              id={'beta-modal.message4'}
              defaultMessage={
                'Use caution when transacting with unknown buyers and sellers. We recommend interacting with counterparties that have had their identities verified.'
              }
            />
          </p>
          <p>
            <FormattedMessage
              id={'beta-modal.message5'}
              defaultMessage={
                'Any disputes that arise will be resolved by Origin’s arbitration team. Note that there is currently no insurance offered on any listings.'
              }
            />
          </p>
        </div>
        <div className="button-container">
          <button className="btn btn-clear" onClick={this.handleToggle}>
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

export default BetaModal
