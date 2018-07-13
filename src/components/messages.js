import React, { Component } from 'react'
import { FormattedDate, FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import ConversationListItem from './conversation-list-item'
import Message from './message'
import PurchaseProgress from './purchase-progress'

import groupByArray from 'utils/groupByArray'

import origin from '../services/origin'

class Messages extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = {
      counterparty: {},
      listing: null,
      newMessage: '',
      purchase: null,
      selectedConversationId: '',
    }
  }

  componentDidMount() {
    this.detectSelectedConversation()
  }

  componentDidUpdate(prevProps, prevState) {
    const { conversations, match } = this.props
    const { selectedConversationId } = this.state
    const { conversationId } = match.params

    // on route change
    if (conversationId && conversationId !== prevProps.match.params.conversationId) {
      this.detectSelectedConversation()
    }

    // on conversation selection
    if (selectedConversationId && selectedConversationId !== prevState.selectedConversationId) {
      this.identifyCounterparty()
      this.loadListing()
    }

    // autoselect a conversation
    if (!selectedConversationId && conversations.length) {
      this.setState({ selectedConversationId: conversations[0].key })
    }
  }

  detectSelectedConversation() {
    const selectedConversationId = this.props.match.params.conversationId || (this.props.conversations[0] || {}).address

    this.setState({ selectedConversationId })
  }

  async findPurchase() {
    const { web3Account } = this.props
    const { counterparty, listing } = this.state
    const { address, sellerAddress } = listing
    const len = await origin.listings.purchasesLength(address)
    const purchaseAddresses = await Promise.all([...Array(len).keys()].map(async i => {
      return await origin.listings.purchaseAddressByIndex(address, i)
    }))
    const purchases = await Promise.all(purchaseAddresses.map(async addr => {
      return await origin.purchases.get(addr)
    }))
    const involvingCounterparty = purchases.filter(p => p.buyerAddress === counterparty.address || p.buyerAddress === web3Account)
    const mostRecent = involvingCounterparty.sort((a, b) => a.created > b.created ? -1 : 1)[0]
    
    this.setState({ purchase: mostRecent })
  }

  identifyCounterparty() {
    const { conversations, web3Account } = this.props
    const { selectedConversationId } = this.state
    const conversation = conversations.find(c => c.key === selectedConversationId)
    const { fromName, recipients, senderAddress, toName } = conversation.values[0]
    const counterpartyRole = senderAddress === web3Account ? 'recipient' : 'sender'

    this.setState({
      counterparty: counterpartyRole === 'recipient' ? {
        address: recipients.find(addr => addr !== senderAddress),
        name: toName,
      } : {
        address: senderAddress,
        name: fromName,
      },
    })
  }

  handleChange(e) {
    const newMessage = e.target.value

    this.setState({ newMessage })
  }

  async handleSubmit(e) {
    e.preventDefault()

    const { web3Account } = this.props
    const { counterparty, newMessage } = this.state

    try {
      await originTest.messaging.sendConvMessage(
        counterparty.address,
        newMessage
      )

      this.setState({ newMessage: '' })
    } catch(err) {
      console.error(err)
    }

  }

  async loadListing() {
    const { conversations } = this.props
    const { selectedConversationId } = this.state
    // find the most recent listing context or set empty value
    const { listingId } = conversations.find(c => c.key === selectedConversationId)
                          .values
                          .sort((a, b) => a.created < b.created ? -1 : 1)
                          .find(m => m.listingId) || {}

    const listing = listingId ? (await origin.listings.get(listingId)) : null

    this.setState({ listing })

    if (listing) {
      this.findPurchase()
    }
  }

  handleConversationSelect(selectedConversationId) {
    this.setState({ selectedConversationId })
  }

  render() {
    const { conversations, messages, web3Account } = this.props
    const { counterparty, listing, newMessage, purchase, selectedConversationId } = this.state
    const { address, name, pictures } = listing || {}
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]
    const perspective = purchase ? (purchase.buyerAddress === web3Account ? 'buyer' : 'seller') : null
    const soldAt = purchase ? purchase.created * 1000 /* convert seconds since epoch to ms */ : null

    return (
      <div className="d-flex messages-wrapper">
        <div className="container">
          <div className="row no-gutters">
            <div className="conversations-list-col col-12 col-sm-4 col-lg-3">
              {conversations.map(c => {
                return (
                  <ConversationListItem key={c.key} conversation={c} active={selectedConversationId === c.key} handleConversationSelect={() => this.handleConversationSelect(c.key)} />
                )
              })}
            </div>
            <div className="conversation-col col-12 col-sm-8 col-lg-9 d-flex flex-column">
              {listing &&
                <div className="listing-summary d-flex">
                  <div className="aspect-ratio">
                    <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
                      <img src={photo || 'images/default-image.svg'} role="presentation" />
                    </div>
                  </div>
                  <div className="content-container d-flex flex-column">
                    {purchase &&
                      <div className="brdcrmb">
                        {perspective === 'buyer' &&
                          <FormattedMessage
                            id={ 'purchase-summary.purchasedFrom' }
                            defaultMessage={ 'Purchased from {sellerLink}' }
                            values={{ sellerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.name}</Link> }}
                          />
                        }
                        {perspective === 'seller' &&
                          <FormattedMessage
                            id={ 'purchase-summary.soldTo' }
                            defaultMessage={ 'Sold to {buyerLink}' }
                            values={{ buyerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.name}</Link> }}
                          />
                        }
                      </div>
                    }
                    <h1>{name}</h1>
                    {purchase &&
                      <div className="state">
                        {perspective === 'buyer' &&
                          <FormattedMessage
                            id={ 'purchase-summary.purchasedFromOn' }
                            defaultMessage={ 'Purchased from {sellerName} on {date}' }
                            values={{ sellerName: counterparty.name, date: <FormattedDate value={soldAt} /> }}
                          />
                        }
                        {perspective === 'seller' &&
                          <FormattedMessage
                            id={ 'purchase-summary.soldToOn' }
                            defaultMessage={ 'Sold to {buyerName} on {date}' }
                            values={{ buyerName: counterparty.name, date: <FormattedDate value={soldAt} /> }}
                          />
                        }
                      </div>
                    }
                    {purchase &&
                      <PurchaseProgress
                        purchase={purchase}
                        perspective={perspective}
                        subdued={true}
                      />
                    }
                  </div>
                </div>
              }
              <div className="conversation">
                {messages.filter(m => m.conversationId === selectedConversationId)
                  .sort((a, b) => a.index < b.index ? -1 : 1)
                  .map(m => <Message key={m.hash} message={m} />)
                }
              </div>
              {selectedConversationId &&
                <form className="new-message" onSubmit={this.handleSubmit}>
                  <input type="text" value={newMessage} onChange={this.handleChange} />
                </form>
              }
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
    web3Account: state.app.web3.account,
  }
}

export default withRouter(connect(mapStateToProps)(Messages))
