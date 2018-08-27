import React, { Component } from 'react'
import { FormattedDate, FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import CompactMessages from 'components/compact-messages'
import PurchaseProgress from 'components/purchase-progress'

import origin from '../services/origin'

class Conversation extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      newMessagePlaceholder: {
        id: 'Messages.newMessagePlaceholder',
        defaultMessage: 'Type something...',
      },
    })

    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.conversationDiv = React.createRef()
    this.textarea = React.createRef()

    this.state = {
      counterparty: {},
      listing: {},
      purchase: {}
    }
  }

  componentDidMount() {
    // try to detect the user before rendering
    this.identifyCounterparty()
  }

  componentDidUpdate(prevProps) {
    const { id, messages, users } = this.props

    // on conversation change
    if (id !== prevProps.id) {
      // textarea is an uncontrolled component and might maintain internal state
      (this.textarea.current || {}).value = ''
      // refresh the counterparty
      this.identifyCounterparty()
      // refresh the listing/purchase context
      this.loadListing()
    }

    // on new message
    if (messages.length > prevProps.messages.length) {
      this.loadListing()
      // auto-scroll to most recent message
      this.scrollToBottom()
    }

    // on user found
    if (users.length > prevProps.users.length) {
      this.identifyCounterparty()
    }
  }

  handleKeyDown(e) {
    const { key, shiftKey } = e

    if (!shiftKey && key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  async handleSubmit(e) {
    e.preventDefault()

    const { id, web3Account } = this.props
    const el = this.textarea.current
    const newMessage = el.value

    if (!newMessage.length) {
      return alert('Please add a message to send')
    }

    try {
      await originTest.messaging.sendConvMessage(id, newMessage.trim())

      el.value = ''
    } catch(err) {
      console.error(err)
    }
  }

  identifyCounterparty() {
    const { id, users, web3Account } = this.props
    const recipients = origin.messaging.getRecipients(id)
    const address = recipients.find(addr => addr !== web3Account)
    const counterparty = users.find(u => u.address === address) || {}

    this.setState({ counterparty })
    this.loadPurchase()
  }

  async loadListing() {
    const { messages } = this.props
    // find the most recent listing context or set empty value
    const { listingAddress } = [...messages].reverse().find(m => m.listingAddress) || {}
    // get the listing
    const listing = listingAddress ? (await origin.listings.get(listingAddress)) : {}
    // if listing does not match state, store and check for a purchase
    if (listing.address !== this.state.listing.address) {
      this.setState({ listing })
      this.loadPurchase()
      this.scrollToBottom()
    }
  }

  async loadPurchase() {
    const { web3Account } = this.props
    const { counterparty, listing, purchase } = this.state
    const { address, sellerAddress } = listing

    // listing may not be found
    if (!address) {
      return
    }

    const len = await origin.listings.purchasesLength(address)
    const purchaseAddresses = await Promise.all([...Array(len).keys()].map(async i => {
      return await origin.listings.purchaseAddressByIndex(address, i)
    }))
    const purchases = await Promise.all(purchaseAddresses.map(async addr => {
      return await origin.purchases.get(addr)
    }))
    const involvingCounterparty = purchases.filter(p => p.buyerAddress === counterparty.address || p.buyerAddress === web3Account)
    const mostRecent = involvingCounterparty.sort((a, b) => a.index > b.index ? -1 : 1)[0]
    // purchase may not be found
    if (!mostRecent) {
      return
    }
    // compare with existing state
    if (
      // purchase is different
      mostRecent.address !== purchase.address ||
      // stage has changed
      mostRecent.stage !== purchase.stage
    ) {
      this.setState({ purchase: mostRecent })
      this.scrollToBottom()
    }
  }

  scrollToBottom() {
    const el = this.conversationDiv.current

    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }

  render() {
    const { activeForm, id, intl, messages, web3Account } = this.props
    const { counterparty, listing, purchase } = this.state
    const { address, name, pictures } = listing
    const { buyerAddress, created } = purchase
    const perspective = buyerAddress ? (buyerAddress === web3Account ? 'buyer' : 'seller') : null
    const soldAt = created ? created * 1000 /* convert seconds since epoch to ms */ : null
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]
    const canDeliverMessage = origin.messaging.canConverseWith(counterparty.address)
    const shouldEnableForm = canDeliverMessage && id

    return (
      <div className="conversation-col col-12 col-sm-8 col-lg-9 d-flex flex-column">
        {address &&
          <div className="listing-summary d-flex">
            <div className="aspect-ratio">
              <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
                <img src={photo || 'images/default-image.svg'} role="presentation" />
              </div>
            </div>
            <div className="content-container d-flex flex-column">
              {buyerAddress &&
                <div className="brdcrmb">
                  {perspective === 'buyer' &&
                    <FormattedMessage
                      id={ 'purchase-summary.purchasedFrom' }
                      defaultMessage={ 'Purchased from {sellerLink}' }
                      values={{ sellerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.fullName}</Link> }}
                    />
                  }
                  {perspective === 'seller' &&
                    <FormattedMessage
                      id={ 'purchase-summary.soldTo' }
                      defaultMessage={ 'Sold to {buyerLink}' }
                      values={{ buyerLink: <Link to={`/users/${counterparty.address}`}>{counterparty.fullName}</Link> }}
                    />
                  }
                </div>
              }
              <h1>{name}</h1>
              {buyerAddress &&
                <div className="state">
                  {perspective === 'buyer' &&
                    <FormattedMessage
                      id={ 'purchase-summary.purchasedFromOn' }
                      defaultMessage={ 'Purchased from {sellerName} on {date}' }
                      values={{ sellerName: counterparty.fullName, date: <FormattedDate value={soldAt} /> }}
                    />
                  }
                  {perspective === 'seller' &&
                    <FormattedMessage
                      id={ 'purchase-summary.soldToOn' }
                      defaultMessage={ 'Sold to {buyerName} on {date}' }
                      values={{ buyerName: counterparty.fullName, date: <FormattedDate value={soldAt} /> }}
                    />
                  }
                </div>
              }
              {buyerAddress &&
                <PurchaseProgress
                  purchase={purchase}
                  perspective={perspective}
                  subdued={true}
                />
              }
            </div>
          </div>
        }
        <div ref={this.conversationDiv} className="conversation">
          <CompactMessages messages={messages}/>
        </div>
        {!shouldEnableForm &&
          <form className="add-message d-flex">
            <textarea tabIndex="0" disabled></textarea>
            <button type="submit" className="btn btn-sm btn-primary" disabled>Send</button>
          </form>
        }
        {shouldEnableForm &&
          <form className="add-message d-flex" onSubmit={this.handleSubmit}>
            <textarea
              ref={this.textarea}
              placeholder={intl.formatMessage(this.intlMessages.newMessagePlaceholder)}
              onKeyDown={this.handleKeyDown}
              tabIndex="0"
              autoFocus>
            </textarea>
            <button type="submit" className="btn btn-sm btn-primary">Send</button>
          </form>
        }
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users,
    web3Account: state.app.web3.account
  }
}

export default connect(mapStateToProps)(injectIntl(Conversation))
