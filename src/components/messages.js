import React, { Component } from 'react'
import {
  FormattedDate,
  FormattedMessage,
  defineMessages,
  injectIntl
} from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import ConversationListItem from 'components/conversation-list-item'
import CompactMessages from 'components/compact-messages'
import PurchaseProgress from 'components/purchase-progress'

import groupByArray from 'utils/groupByArray'

import origin from '../services/origin'

class Messages extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      newMessagePlaceholder: {
        id: 'Messages.newMessagePlaceholder',
        defaultMessage: 'Type something...'
      }
    })

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.conversationDiv = React.createRef()
    this.textarea = React.createRef()
    this.state = {
      conversation: {},
      counterparty: {},
      listing: {},
      messages: [],
      purchase: {},
      selectedConversationId: ''
    }
  }

  componentDidMount() {
    this.detectSelectedConversation()
  }

  componentDidUpdate(prevProps, prevState) {
    const { conversations, match, messages } = this.props
    const { conversation, selectedConversationId } = this.state
    const { conversationId } = match.params
    const changedSelectedConversationId =
      selectedConversationId !== prevState.selectedConversationId

    // on route change
    if (
      conversationId &&
      conversationId !== prevProps.match.params.conversationId
    ) {
      this.detectSelectedConversation()
    }

    // autoselect a conversation
    if (!selectedConversationId && conversations.length) {
      this.setState({ selectedConversationId: conversations[0].key })
    }

    const selectedConversation =
      conversations.find(({ key }) => key === selectedConversationId) || {}

    // on presence of selected conversation
    if (
      selectedConversation.key &&
      selectedConversation.key !== conversation.key
    ) {
      this.setState({ conversation: selectedConversation })
    }

    // on state conversation change
    if (conversation.key && conversation.key !== prevState.conversation.key) {
      this.loadListing()
      this.identifyCounterparty()
    }

    // on new conversation values
    if (
      prevState.conversation.values &&
      conversation.values.length > prevState.conversation.values.length
    ) {
      this.loadListing()
      this.identifyCounterparty()
    }

    // on messages
    if (messages.length !== prevProps.messages.length && conversation.key) {
      // update conversation with potentially new values
      this.setState({ conversation: selectedConversation })
      this.loadListing()
    }

    // move filtered and sorted messages to state
    const messagesFiltered = messages.filter(
      m => m.conversationId === selectedConversationId
    )
    const messagesFilteredPreviously = prevProps.messages.filter(
      m => m.conversationId === selectedConversationId
    )

    if (
      changedSelectedConversationId ||
      messagesFiltered.map(({ hash }) => hash).join() !==
        messagesFilteredPreviously.map(({ hash }) => hash).join()
    ) {
      this.setState({
        messages: messagesFiltered.sort((a, b) => (a.index < b.index ? -1 : 1))
      })
    }

    // auto-scroll to most recent message
    const el = this.conversationDiv.current

    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }

  detectSelectedConversation() {
    const selectedConversationId =
      this.props.match.params.conversationId ||
      (this.props.conversations[0] || {}).address

    this.setState({ selectedConversationId })
  }

  async findPurchase() {
    const { web3Account } = this.props
    const { counterparty, listing, purchase } = this.state
    const { address } = listing
    const len = await origin.listings.purchasesLength(address)
    const purchaseAddresses = await Promise.all(
      [...Array(len).keys()].map(async i => {
        return await origin.listings.purchaseAddressByIndex(address, i)
      })
    )
    const purchases = await Promise.all(
      purchaseAddresses.map(async addr => {
        return await origin.purchases.get(addr)
      })
    )
    const involvingCounterparty = purchases.filter(
      p =>
        p.buyerAddress === counterparty.address ||
        p.buyerAddress === web3Account
    )
    const mostRecent =
      involvingCounterparty.sort((a, b) => (a.index > b.index ? -1 : 1))[0] ||
      {}

    if (mostRecent.address !== purchase.address) {
      this.setState({ purchase: mostRecent })
    }
  }

  identifyCounterparty() {
    const { users, web3Account } = this.props
    const { conversation } = this.state
    const { recipients, senderAddress } = conversation.values[0]
    const counterpartyRole =
      senderAddress === web3Account ? 'recipient' : 'sender'
    const address =
      counterpartyRole === 'recipient'
        ? recipients.find(addr => addr !== senderAddress)
        : senderAddress
    const counterparty = users.find(u => u.address === address) || {}

    this.setState({ counterparty })
  }

  handleKeyDown(e) {
    const { key, shiftKey } = e

    if (!shiftKey && key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const { selectedConversationId } = this.state
    const el = this.textarea.current
    const newMessage = el.value

    if (!newMessage.length) {
      return alert('Please add a message to send')
    }

    try {
      await originTest.messaging.sendConvMessage(
        selectedConversationId,
        newMessage.trim()
      )

      el.value = ''
    } catch (err) {
      console.error(err)
    }
  }

  async loadListing() {
    const { conversation } = this.state
    // find the most recent listing context or set empty value
    const { listingAddress } =
      conversation.values
        .sort((a, b) => (a.index > b.index ? -1 : 1))
        .find(m => m.listingAddress) || {}

    const listing = listingAddress
      ? await origin.listings.get(listingAddress)
      : {}

    if (listing.address !== this.state.listing.address) {
      this.setState({ listing })
      this.findPurchase()
    }
  }

  handleConversationSelect(selectedConversationId) {
    this.setState({ selectedConversationId })
  }

  render() {
    const { conversations, intl, web3Account } = this.props
    const {
      counterparty,
      listing,
      messages,
      purchase,
      selectedConversationId
    } = this.state
    const { address, name, pictures } = listing
    const { buyerAddress, created } = purchase
    const photo = pictures && pictures.length > 0 && pictures[0]
    const perspective = buyerAddress
      ? buyerAddress === web3Account
        ? 'buyer'
        : 'seller'
      : null
    const soldAt = created
      ? created * 1000 /* convert seconds since epoch to ms */
      : null
    const canDeliverMessage = origin.messaging.canConverseWith(
      counterparty.address
    )

    return (
      <div className="d-flex messages-wrapper">
        <div className="container">
          <div className="row no-gutters">
            <div className="conversations-list-col col-12 col-sm-4 col-lg-3 d-flex flex-sm-column">
              {conversations.map(c => {
                return (
                  <ConversationListItem
                    key={c.key}
                    conversation={c}
                    active={selectedConversationId === c.key}
                    handleConversationSelect={() =>
                      this.handleConversationSelect(c.key)
                    }
                  />
                )
              })}
            </div>
            <div className="conversation-col col-12 col-sm-8 col-lg-9 d-flex flex-column">
              {address && (
                <div className="listing-summary d-flex">
                  <div className="aspect-ratio">
                    <div
                      className={`${
                        photo ? '' : 'placeholder '
                      }image-container d-flex justify-content-center`}
                    >
                      <img
                        src={photo || 'images/default-image.svg'}
                        role="presentation"
                      />
                    </div>
                  </div>
                  <div className="content-container d-flex flex-column">
                    {buyerAddress && (
                      <div className="brdcrmb">
                        {perspective === 'buyer' && (
                          <FormattedMessage
                            id={'purchase-summary.purchasedFrom'}
                            defaultMessage={'Purchased from {sellerLink}'}
                            values={{
                              sellerLink: (
                                <Link to={`/users/${counterparty.address}`}>
                                  {counterparty.fullName}
                                </Link>
                              )
                            }}
                          />
                        )}
                        {perspective === 'seller' && (
                          <FormattedMessage
                            id={'purchase-summary.soldTo'}
                            defaultMessage={'Sold to {buyerLink}'}
                            values={{
                              buyerLink: (
                                <Link to={`/users/${counterparty.address}`}>
                                  {counterparty.fullName}
                                </Link>
                              )
                            }}
                          />
                        )}
                      </div>
                    )}
                    <h1>{name}</h1>
                    {buyerAddress && (
                      <div className="state">
                        {perspective === 'buyer' && (
                          <FormattedMessage
                            id={'purchase-summary.purchasedFromOn'}
                            defaultMessage={
                              'Purchased from {sellerName} on {date}'
                            }
                            values={{
                              sellerName: counterparty.fullName,
                              date: <FormattedDate value={soldAt} />
                            }}
                          />
                        )}
                        {perspective === 'seller' && (
                          <FormattedMessage
                            id={'purchase-summary.soldToOn'}
                            defaultMessage={'Sold to {buyerName} on {date}'}
                            values={{
                              buyerName: counterparty.fullName,
                              date: <FormattedDate value={soldAt} />
                            }}
                          />
                        )}
                      </div>
                    )}
                    {buyerAddress && (
                      <PurchaseProgress
                        purchase={purchase}
                        perspective={perspective}
                        subdued={true}
                      />
                    )}
                  </div>
                </div>
              )}
              <div ref={this.conversationDiv} className="conversation">
                <CompactMessages messages={messages} />
              </div>
              {canDeliverMessage &&
                selectedConversationId && (
                <form
                  className="add-message d-flex"
                  onSubmit={this.handleSubmit}
                >
                  <textarea
                    ref={this.textarea}
                    placeholder={intl.formatMessage(
                      this.intlMessages.newMessagePlaceholder
                    )}
                    onKeyDown={this.handleKeyDown}
                    tabIndex="0"
                    autoFocus
                  />
                  <button type="submit" className="btn btn-sm btn-primary">
                      Send
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    conversations: groupByArray(state.messages, 'conversationId'),
    messages: state.messages,
    messagingEnabled: state.app.messagingEnabled,
    users: state.users,
    web3Account: state.app.web3.account
  }
}

export default withRouter(connect(mapStateToProps)(injectIntl(Messages)))
