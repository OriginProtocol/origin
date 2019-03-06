import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { storeWeb3Intent } from 'actions/App'

import MessageNew from 'components/message-new'

import origin from '../services/origin'

const { web3 } = origin.contractService

class Contact extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      sendMessages: {
        id: 'contact.sendMessages',
        defaultMessage: 'send messages'
      }
    })

    this.handleToggle = this.handleToggle.bind(this)
    this.state = { modalOpen: false }
  }

  handleToggle(e) {
    e.preventDefault()
    const { history, intl, messages, recipientAddress, storeWeb3Intent, wallet } = this.props
    const intent = intl.formatMessage(this.intlMessages.sendMessages)
    storeWeb3Intent(intent)

    if (!web3.currentProvider.isOrigin && wallet.address) {
      const existingConversation = messages.find(({ conversationId }) => {
        return conversationId.includes(recipientAddress)
      })

      if (existingConversation) {
        return history.push(`/messages/${existingConversation.conversationId}`)
      }

      this.setState({ modalOpen: !this.state.modalOpen })
    }
  }

  render() {
    const {
      className,
      listingId,
      purchaseId,
      recipientAddress,
      recipientTitle
    } = this.props
    const title = recipientTitle || ''

    return (
      <Fragment>
        <a href="#" onClick={this.handleToggle} className={`btn${className ? ` ${className}` : ''}`}>
          {!title && (
            <FormattedMessage
              id={'contact.generic'}
              defaultMessage={'Contact'}
            />
          )}
          {title.toLowerCase() === 'buyer' && (
            <FormattedMessage
              id={'contact.buyer'}
              defaultMessage={'Contact Buyer'}
            />
          )}
          {title.toLowerCase() === 'seller' && (
            <FormattedMessage
              id={'contact.seller'}
              defaultMessage={'Contact Seller'}
            />
          )}
        </a>
        <MessageNew
          open={this.state.modalOpen}
          recipientAddress={recipientAddress}
          listingId={listingId}
          purchaseId={purchaseId}
          handleToggle={this.handleToggle}
        />
      </Fragment>
    )
  }
}

const mapStateToProps = ({ messages, wallet }) => {
  return {
    messages,
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(injectIntl(Contact))
)
