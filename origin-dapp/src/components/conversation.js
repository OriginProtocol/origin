import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import remove from 'lodash/remove'
import isEqual from 'lodash/isEqual'

import { fetchUser } from 'actions/User'
import { showMainNav } from 'actions/App'

import CompactMessages from 'components/compact-messages'

import { generateCroppedImage } from 'utils/fileUtils'
import { getListing } from 'utils/listing'
import { truncateAddress, formattedAddress, abbreviateName } from 'utils/user'
import { getOfferEvents } from 'utils/offer'

import origin from '../services/origin'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || 2 * 1024 * 1024 // 2 MiB
const formatDate = timestamp => moment(timestamp * 1000).format('MMM D, YYYY')

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
    this.formatOfferMessage = this.formatOfferMessage.bind(this)

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
    const { smallScreenOrDevice, showMainNav } = this.props
    let updateShowNav = true

    // try to detect the user before rendering
    this.identifyCounterparty()

    if (smallScreenOrDevice) {
      this.loadListing()
      updateShowNav = false
      this.scrollToBottom()
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
    const newMessage = this.getLatestMessage(messages)
    const prevPropsNewMessage = this.getLatestMessage(prevProps.messages)

    if (!isEqual(newMessage, prevPropsNewMessage)) {
      this.loadListing()
      // auto-scroll to most recent message
      this.scrollToBottom()
    }

    // on user found
    if (users.length > prevProps.users.length) {
      this.identifyCounterparty()
    }
  }

  componentWillUnmount() {
    this.props.showMainNav(true)
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
    let counterparty = users.find(u => formattedAddress(u.address) === formattedAddress(address))

    if (!counterparty) {
      fetchUser(address)

      counterparty = { address }
    }

    this.setState({ counterparty })

    origin.messaging.canConverseWith(address).then(result => {
      this.setState({ canConverseCounterparty: result })
      })
    this.loadPurchase()
  }

  async loadListing() {
    const { messages } = this.props
    // Find the most recent listing context or set empty value.
    const { listingId } = [...messages].reverse().find(m => m.listingId) || {}

    // If listingId does not match state, store and check for a purchase.
    if (listingId !== this.state.listing.id) {
      try {
        const listing = listingId ? await getListing(listingId, { translate: true }) : {}
        this.setState({ listing })
        this.loadPurchase()
      } catch ( error ) {
        console.log('Cannot get listing: ', listingId, error)
      }
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

  getLatestMessage(messages = []) {
    const lastMessageIndex = messages.length - 1
    const sortOrder = (a, b) => (a.created < b.created ? -1 : 1)
    return messages.sort(sortOrder)[lastMessageIndex]
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

  formatOfferMessage(info) {
    const { listing = {}, purchase } = this.state
    const { includeNav, users, smallScreenOrDevice, withListingSummary } = this.props

    if (smallScreenOrDevice || !withListingSummary) return

    const { returnValues = {}, event, timestamp } = info
    const partyAddress = formattedAddress(returnValues.party)
    const user = users.find((user) => formattedAddress(user.address) === partyAddress)
    const userName = abbreviateName(user)
    const party = userName || truncateAddress(returnValues.party)
    const date = formatDate(timestamp)

    function withdrawnOrRejected() {
      const withdrawn = formattedAddress(purchase.buyer) === partyAddress
      const withdrawnMessage = 'withdrew their offer for'
      const rejectedMessage = 'rejected the offer for'

      return withdrawn ? withdrawnMessage : rejectedMessage
    }

    const offerMessages = {
      'OfferCreated': (
        <FormattedMessage
          id={'conversation.offerCreated'}
          defaultMessage={'{party} made an offer on {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
      'OfferWithdrawn': (
        <FormattedMessage
          id={'conversation.offerWithdrawnOrRejected'}
          defaultMessage={'{party} {action} {name} on {date}'}
          values={{ party, date, name: listing.name, action: withdrawnOrRejected() }}
        />
      ),
      'OfferAccepted': (
        <FormattedMessage
          id={'conversation.offerAccepted'}
          defaultMessage={'{party} accepted the offer for {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
      'OfferDisputed': (
        <FormattedMessage
          id={'conversation.offerDisputed'}
          defaultMessage={'{party} initiated a dispute for {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
      'OfferRuling': (
        <FormattedMessage
          id={'conversation.offerRuling'}
          defaultMessage={'{party} made a ruling on the dispute for {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
      'OfferFinalized': (
        <FormattedMessage
          id={'conversation.offerFinalized'}
          defaultMessage={'{party} finalized the offer for {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
      'OfferData': (
        <FormattedMessage
          id={'conversation.offerData'}
          defaultMessage={'{party} updated information for {name} on {date}'}
          values={{ party, date, name: listing.name }}
        />
      ),
    }

    return (
      <div key={new Date() + Math.random()} className="purchase-info">
        {includeNav && (
          <Link to={`/purchases/${purchase.id}`} target="_blank" rel="noopener noreferrer">
            {offerMessages[event]}
          </Link>
        )}
        {!includeNav && offerMessages[event]}
      </div>
    )
  }

  render() {
    const { id, includeNav, intl, messages, wallet, smallScreenOrDevice } = this.props
    const {
      counterparty,
      files,
      invalidTextInput,
      purchase,
      canConverseCounterparty
    } = this.state
    const canDeliverMessage =
      counterparty.address &&
      canConverseCounterparty
    const shouldEnableForm = id &&
      origin.messaging.getRecipients(id).includes(formattedAddress(wallet.address)) &&
      canDeliverMessage
    const offerEvents = getOfferEvents(purchase)
    const combinedMessages = remove([...offerEvents, ...messages], undefined)
    const textAreaSize = smallScreenOrDevice ? '2' : '4'

    return (
      <Fragment>
        <div ref={this.conversationDiv} className="conversation text-center">
          <CompactMessages
            includeNav={includeNav}
            messages={combinedMessages}
            wallet={wallet}
            formatOfferMessage={this.formatOfferMessage}
            smallScreenOrDevice={smallScreenOrDevice}
          />
        </div>
        {!shouldEnableForm && (
          <form className="add-message d-flex">
            <textarea rows={textAreaSize} tabIndex="0" disabled />
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
                rows={textAreaSize}
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
