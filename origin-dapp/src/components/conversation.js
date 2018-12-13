import React, { Component, Fragment } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { fetchUser } from 'actions/User'

import CompactMessages from 'components/compact-messages'
import OfferStatusEvent from 'components/offer-status-event'
import PurchaseProgress from 'components/purchase-progress'

import { generateCroppedImage } from 'utils/fileUtils'
import { getListing } from 'utils/listing'
import { formattedAddress } from 'utils/user'

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
    // try to detect the user before rendering
    this.identifyCounterparty()

    if (this.props.mobileDevice) {
      this.loadListing()
    }

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
      const listing = listingId ? await getListing(listingId, { translate: true }) : {}
      this.setState({ listing })
      this.loadPurchase()
    }
  }

  async loadPurchase() {
    const { wallet } = this.props
    const { counterparty, listing, purchase } = this.state

    // listing may not be found
    if (!listing.id) {
      return this.setState({ purchase: {} })
    }

    const offers = await origin.marketplace.getOffers(listing.id)
    const involvingCounterparty = offers.filter(
      o => formattedAddress(o.buyer) === formattedAddress(counterparty.address) || formattedAddress(o.buyer) === formattedAddress(wallet.address)
    )
    const mostRecent = involvingCounterparty.sort(
      (a, b) => (a.createdAt > b.createdAt ? -1 : 1)
    )[0]

    // purchase may not be found
    if (!mostRecent) {
      return this.setState({ purchase: {} })
    }
    // compare with existing state
    if (
      // purchase is different
      mostRecent.id !== purchase.id ||
      // stage has changed
      mostRecent.status !== purchase.status
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

  render() {
    const { id, intl, messages, mobileDevice, wallet, withListingSummary } = this.props
    const {
      counterparty,
      files,
      invalidTextInput,
      listing,
      purchase
    } = this.state
    const { name, pictures } = listing
    const { buyer, status } = purchase
    const perspective = buyer
      ? formattedAddress(buyer) === formattedAddress(wallet.address)
        ? 'buyer'
        : 'seller'
      : null
    const photo = pictures && pictures.length > 0 && pictures[0]
    const canDeliverMessage =
      counterparty.address &&
      origin.messaging.canConverseWith(formattedAddress(counterparty.address))
    const shouldEnableForm = id &&
      origin.messaging.getRecipients(id).includes(formattedAddress(wallet.address)) &&
      canDeliverMessage

    const classNames = mobileDevice ? 'justify-content-start' : 'justify-content-center'

    return (
      <Fragment>
        {withListingSummary &&
          listing.id && (
          <Link to={`/listing/${listing.id}`}>
            <div className="listing-summary d-flex">
              <div className="aspect-ratio">
                <div
                  className={`${
                    photo ? '' : 'placeholder '
                  }image-container d-flex ${classNames}`}
                >
                  <img
                    src={photo || 'images/default-image.svg'}
                    role="presentation"
                  />
                </div>
              </div>
              <div className="content-container d-flex flex-column">
                <h1 className="seller">{listing.seller}</h1>
                <h1 className="listing-title text-truncate">{name}</h1>
                {purchase.id && (
                  <div className="state">
                    <OfferStatusEvent offer={purchase} />
                  </div>
                )}
                {buyer &&
                    purchase.id && (
                  <PurchaseProgress
                    purchase={purchase}
                    perspective={perspective}
                    subdued={true}
                    currentStep={parseInt(status)}
                    maxStep={perspective === 'buyer' ? 3 : 4}
                  />
                )}
              </div>
            </div>
          </Link>
        )}
        <div ref={this.conversationDiv} className="conversation">
          <CompactMessages messages={messages} />
        </div>
        {!shouldEnableForm && (
          <form className="add-message d-flex">
            <textarea tabIndex="0" disabled />
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
              accept="image/jpeg,image/gif,image/png"
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

const mapStateToProps = ({ users, wallet }) => {
  return {
    users,
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: addr => dispatch(fetchUser(addr))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Conversation))
