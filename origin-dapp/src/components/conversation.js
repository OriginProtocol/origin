import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import moment from 'moment'

import { fetchUser } from 'actions/User'
import { showMainNav } from 'actions/App'

import CompactMessages from 'components/compact-messages'

import { generateCroppedImage } from 'utils/fileUtils'
import { getListing } from 'utils/listing'
import { abbreviateName, truncateAddress, formattedAddress } from 'utils/user'
import { getPurchaseEvents } from 'utils/offer'

import origin from '../services/origin'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || 2 * 1024 * 1024 // 2 MiB

class Conversation extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      newMessagePlaceholder: {
        id: 'conversation.newMessagePlaceholder',
        defaultMessage: 'Type something...'
      }
    })

    this.handleClick = this.handleClick.bind(this)
    this.handleInput = this.handleInput.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.sendMessage = this.sendMessage.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)

    this.conversationDiv = React.createRef()
    this.fileInput = React.createRef()
    this.form = React.createRef()
    this.textarea = React.createRef()

    this.state = {
      counterparty: {},
      files: [],
      listing: {},
      purchase: {},
      invalidTextInput: false
    }
  }

  componentDidMount() {
    const { smallScreenOrDevice, showMainNav, showNav } = this.props
    let updateShowNav = true
    // try to detect the user before rendering
    this.identifyCounterparty()


    if (smallScreenOrDevice) {
      this.loadListing()
      updateShowNav = false
      // if (showNav) showMainNav(false)
    }

    showMainNav(updateShowNav)

    // why does the page jump ?????
    // regardless, need to scroll past the banner for now anyway
    setTimeout(() => {
      const banner = document.getElementsByClassName('warning').item(0)

      window.scrollTo(0, banner ? banner.offsetHeight : 0)
    }, 400)
  }

  componentDidUpdate(prevProps) {
    const { id, messages, users } = this.props

    // on conversation change
    if (id !== prevProps.id) {
      // immediately clear the listing/purchase context
      if (this.state.listing.id) {
        this.setState({ listing: {}, purchase: {} })
      }
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

  handleClick() {
    this.fileInput.current.click()
  }

  handleInput(event) {
    const filesObj = event.target.files

    for (const key in filesObj) {
      if (filesObj.hasOwnProperty(key)) {
        generateCroppedImage(filesObj[key], null, (dataUri) => {
          this.setState((state) => {
            return {
              ...state,
              files: [...state.files, dataUri]
            }
          })
        })
      }
    }
  }

  handleKeyDown(e) {
    const { key, shiftKey } = e

    if (!shiftKey && key === 'Enter') {
      this.handleSubmit(e)
    }
  }

  handleSubmit(e) {
    e.preventDefault()

    const el = this.textarea.current

    if (!el) {
      // It's an image
      if (this.state.files[0].length > imageMaxSize) {
        this.form.current.reset()
        this.setState({ files: [] })
        return
      }
      return this.sendMessage(this.state.files[0])
    }

    const newMessage = el.value

    if (!newMessage.length) {
      this.setState({ invalidTextInput: true })
    } else {
      this.sendMessage(newMessage)
    }
  }

  identifyCounterparty() {
    const { fetchUser, id, users, wallet } = this.props

    if (!id) {
      return this.setState({ counterparty: {} })
    }

    const recipients = origin.messaging.getRecipients(id)
    const address = recipients.find(addr => formattedAddress(addr) !== formattedAddress(wallet.address))
    const counterparty = users.find(u => formattedAddress(u.address) === formattedAddress(address)) || { address }

    !counterparty.address && fetchUser(address)

    this.setState({ counterparty })
    this.loadPurchase()
  }

  async loadListing() {
    const { messages } = this.props
    // Find the most recent listing context or set empty value.
    const { listingId } = [...messages].reverse().find(m => m.listingId) || {}

    // If listingId does not match state, store and check for a purchase.
    if (listingId !== this.state.listing.id) {
      const listing = listingId ? await getListing(listingId, true) : {}
      this.setState({ listing })
      this.loadPurchase()
    }
  }

  async loadPurchase() {
    const { wallet } = this.props
    const { counterparty, listing, purchase } = this.state

    if (!listing.id) {
      return this.setState({ purchase: {} })
    }

    const offers = await origin.marketplace.getOffers(listing.id)
    const involvingCounterparty = offers.filter(o => {
      const buyerIsCounterparty = formattedAddress(o.buyer) === formattedAddress(counterparty.address)
      const buyerIsCurrentUser = formattedAddress(o.buyer) === formattedAddress(wallet.address)

      return buyerIsCounterparty || buyerIsCurrentUser
    })

    const sortOrder = (a, b) => (a.createdAt > b.createdAt ? -1 : 1)
    const mostRecent = involvingCounterparty.sort(sortOrder)[0]

    if (!mostRecent) {
      return this.setState({ purchase: {} })
    }

    const purchaseHasChanged = mostRecent.id !== purchase.id
    const statusHasChanged = mostRecent.status !== purchase.status

    if (purchaseHasChanged || statusHasChanged) {
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

  async sendMessage(content) {
    try {
      await origin.messaging.sendConvMessage(this.props.id, content)

      this.form.current.reset()

      if (this.state.files.length) {
        this.setState({ files: [] })
      }
    } catch (err) {
      console.error(err)
    }
  }

  getLastMessage(messages) {
    const lastMessageIndex = messages.length - 1
    const sortOrder = (a, b) => (a.created < b.created ? -1 : 1)
    return messages.sort(sortOrder)[lastMessageIndex]
  }

  getFirstMessage(messages) {
    const sortOrder = (a, b) => (a.created < b.created ? -1 : 1)
    return messages.sort(sortOrder)[0]
  }

  formatPurchaseMessage(buyerName, info) {
    const { listing = {} } = this.state

    return (
      <span key={new Date() + Math.random()} className="purchase-info">
        {buyerName} did some action to {name} on {moment(info.timestamp).format('MMM Do h:mm a')}
      </span>
    )
  }

  render() {
    const { id, intl, messages, smallScreenOrDevice, wallet, withListingSummary } = this.props
    const {
      counterparty,
      files,
      invalidTextInput,
      listing,
      purchase
    } = this.state
    const { name, created } = listing
    const counterpartyAddress = formattedAddress(counterparty.address)
    const canDeliverMessage =
      counterparty.address &&
      origin.messaging.canConverseWith(counterpartyAddress)
    const shouldEnableForm = id &&
      origin.messaging.getRecipients(id).includes(formattedAddress(wallet.address)) &&
      canDeliverMessage
    const buyerName = abbreviateName(counterparty) || truncateAddress(counterpartyAddress)
    const latestMessage = this.getLastMessage(messages)
    const firstMessage = this.getFirstMessage(messages)
    const infoWithLatestTime = (lastMessage) => (result, info) => {
      const noInfo = !info || info === 0
      if (noInfo) return result

      const { timestamp } = info
      const { created } = lastMessage

      if (timestamp > (created/1000)) return [...result, info]
      return result
    }

    const infoWithEarliestTime = (firstMessage) => (result, info) => {
      const noInfo = !info || info === 0
      if (noInfo) return result
      const { timestamp } = info
      const { created } = firstMessage

      if (timestamp < (created/1000)) return [...result, info]
      return result
    }
    const purchaseEvents = getPurchaseEvents(purchase)

    const [
      offerCreated,
      offerWithdrawn,
      offerAccepted,
      offerDisputed,
      offerRuling,
      offerFinalized,
      offerData
    ] = purchaseEvents
    const postMessagesPurchaseInfo = purchaseEvents.reduce(infoWithLatestTime(latestMessage), [])
    const anteMessagesPurchaseInfo = purchaseEvents.reduce(infoWithEarliestTime(firstMessage), [])
    console.log("DO I HAVE THE SELLER", postMessagesPurchaseInfo)
    console.log("HOW ABOUT DO I HAVE THE SELLER HERE", anteMessagesPurchaseInfo)

    return (
      <Fragment>
        {((!smallScreenOrDevice) && withListingSummary) &&
          listing.id && (
            anteMessagesPurchaseInfo.map((offerInfo) => (
              this.formatPurchaseMessage(buyerName, offerInfo)
            ))
          )
        }
        <div ref={this.conversationDiv} className="conversation">
          <CompactMessages
            messages={messages}
            purchase={purchase}
            listing={listing}
            wallet={wallet}
            counterparty={counterparty}
            purchaseEvents={purchaseEvents}
            formatPurchaseMessage={this.formatPurchaseMessage}
          />
        </div>
        {((!smallScreenOrDevice) && withListingSummary) &&
          listing.id && (
            postMessagesPurchaseInfo.map((offerInfo) => (
              this.formatPurchaseMessage(buyerName, offerInfo)
            ))
          )
        }
        {!shouldEnableForm && (
          <form className="add-message d-flex">
            <textarea rows="4" tabIndex="0" disabled />
            <button type="submit" className="btn btn-sm btn-primary" disabled>
              Send
            </button>
          </form>
        )}
        {shouldEnableForm && (
          <form
            ref={this.form}
            className="add-message d-flex"
            onSubmit={this.handleSubmit}
          >
            {!files.length &&
              !invalidTextInput && (
              <textarea
                ref={this.textarea}
                placeholder={intl.formatMessage(
                  this.intlMessages.newMessagePlaceholder
                )}
                onKeyDown={this.handleKeyDown}
                tabIndex="0"
                rows="4"
                autoFocus
              />
            )}
            {invalidTextInput && (
              <div className="files-container">
                <p
                  className="text-danger"
                  onClick={() =>
                    this.setState({
                      invalidTextInput: false
                    })
                  }
                >
                  {invalidTextInput && (
                    <FormattedMessage
                      id={'conversation.invalidTextInput'}
                      defaultMessage={'Please add a message to send.'}
                    />
                  )}
                </p>
              </div>
            )}
            {!!files.length && (
              <div className="files-container">
                {files.map((dataUri, i) => (
                  <div key={i} className="image-container">
                    <img src={dataUri} className="preview-thumbnail" />
                    <a
                      className="image-overlay-btn cancel-image"
                      aria-label="Close"
                      onClick={() => this.setState({ files: [] })}
                    >
                      <span aria-hidden="true">&times;</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
            <img
              src="images/add-photo-icon.svg"
              className="add-photo"
              role="presentation"
              onClick={this.handleClick}
            />
            <input
              type="file"
              ref={this.fileInput}
              className="d-none"
              onChange={this.handleInput}
            />
            <button type="submit" className="btn btn-sm btn-primary">
              Send
            </button>
          </form>
        )}
      </Fragment>
    )
  }
}

const mapStateToProps = ({ users, wallet, app }) => {
  return {
    users,
    wallet,
    showNav: app.showNav
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr)),
  showMainNav: (showNav) => dispatch(showMainNav(showNav))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Conversation))
