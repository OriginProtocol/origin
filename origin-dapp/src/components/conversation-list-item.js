import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Avatar from 'components/avatar'
import { getListing } from 'utils/listing'

const mobileLocale = {
  relativeTime: {
    past: '%s',
    s: "Now",
    ss: "%ds",
    m: "1min",
    mm: "%dmin",
    h: "1h",
    hh: "%dh",
    d: "1d",
    dd: "%dd",
    M: "1mo",
    MM: "%dmo",
    y: "1y",
    yy: "%dy"
  }
}

class ConversationListItem extends Component {
  constructor(props) {
    super(props)

    this.state = { listing: {}, lastMessage: {} }
  }

  async componentDidMount() {
    const { conversation } = this.props

    moment.updateLocale('en', mobileLocale)
    const lastMessage = this.getLastMessage(conversation)

    const listing = lastMessage.listingId ? await getListing(lastMessage.listingId, true) : {}
    this.setState({ listing, lastMessage })
  }

  componentDidUpdate(prevProps) {
    const { conversation } = this.props

    if (prevProps.conversation !== conversation) {
      this.setState({ lastMessage: this.getLastMessage(conversation) })
    }
  }

  componentWillUnmount() {
    moment.updateLocale('en', null);
  }

  getLastMessage(conversation) {
    const lastMessageIndex = conversation.values.length - 1
    const sortOrder = (a, b) => (a.created < b.created ? -1 : 1)
    return conversation.values.sort(sortOrder)[lastMessageIndex]
  }

  render() {
    const {
      active,
      conversation,
      handleConversationSelect,
      users,
      web3Account,
      mobileDevice
    } = this.props
    const { listing, lastMessage } = this.state

    const { content, recipients, senderAddress, created } = lastMessage
    const role = senderAddress === web3Account ? 'sender' : 'recipient'
    const counterpartyAddress =
      role === 'sender'
        ? recipients.find(addr => addr !== senderAddress)
        : senderAddress
    const counterparty =
      users.find(u => u.address === counterpartyAddress) || {}
    const unreadCount = conversation.values.filter(msg => {
      return msg.status === 'unread' && msg.senderAddress !== web3Account
    }).length
    const { profile } = counterparty
    const conversationItem = mobileDevice ? 'mobile-conversation-list-item' : `conversation-list-item${active ? ' active' : ''}`

    return (
      <div
        onClick={handleConversationSelect}
        className={`d-flex message ${conversationItem}`}
      >
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container text-truncate">
          <div className="sender text-truncate">
            <span>{counterparty.fullName || counterpartyAddress}</span>
          </div>
          { mobileDevice && <div className="listing-title text-truncate">{listing.name}</div> }
          <div className={`message text-truncate ${!listing.name ? 'no-listing' : ''}`}>{content}</div>
        </div>
        <div className={`meta-container ${mobileDevice ? 'justify-content-start ml-auto' : 'text-right'}`}>
          { mobileDevice && (
            <div className="timestamp align-self-end">
              {moment(created).fromNow()}
            </div>
          )}
          {!!unreadCount && (
            <div className={`unread count ${mobileDevice ? 'text-center mx-auto' : 'text-right'}`}>
              <div>{unreadCount}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users,
    web3Account: state.app.web3.account,
    mobileDevice: state.app.mobileDevice
  }
}

export default connect(mapStateToProps)(ConversationListItem)
