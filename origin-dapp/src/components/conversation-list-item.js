import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment-timezone'
import Avatar from 'components/avatar'
import { getListing } from 'utils/listing'
import { defineMessages, injectIntl } from 'react-intl'

import { formattedAddress, abbreviateName } from 'utils/user'

class ConversationListItem extends Component {
  constructor(props) {
    super(props)
    const { selectedLanguageCode } = this.props

    this.intlMessages = defineMessages({
      s: {
        id: 'messages.moment.sec',
        defaultMessage: 'Now'
      },
      ss: {
        id: 'messages.moment.seconds',
        defaultMessage: 's'
      },
      min: {
        id: 'messages.moment.minutes',
        defaultMessage: 'min'
      },
      hour: {
        id: 'messages.moment.hours',
        defaultMessage: 'h'
      },
      day: {
        id: 'messages.moment.days',
        defaultMessage: 'd'
      },
      week: {
        id: 'messages.moment.week',
        defaultMessage: 'wk'
      },
      month: {
        id: 'messages.moment.months',
        defaultMessage: 'mo'
      },
      year: {
        id: 'messages.moment.years',
        defaultMessage: 'y'
      }
    })
    const modifiedLanguageCode = selectedLanguageCode === 'en-US' ? 'en' : selectedLanguageCode

    this.state = { listing: {}, lastMessage: {}, createdAt: '', modifiedLanguageCode }
  }

  async componentDidMount() {
    const { conversation, intl } = this.props
    const { modifiedLanguageCode } = this.state

    const localeConfig = {
      relativeTime: {
        past: '%s',
        s: intl.formatMessage(this.intlMessages.s),
        ss: `%d${intl.formatMessage(this.intlMessages.ss)}`,
        m: `1${intl.formatMessage(this.intlMessages.min)}`,
        mm: `%d${intl.formatMessage(this.intlMessages.min)}`,
        h: `1${intl.formatMessage(this.intlMessages.hour)}`,
        hh: `%d${intl.formatMessage(this.intlMessages.hour)}`,
        d: `1${intl.formatMessage(this.intlMessages.day)}`,
        dd: (days) => {
          if (days < 7) {
            return `${days + intl.formatMessage(this.intlMessages.day)}`
          } else {
            return `${Math.round(days / 7) + intl.formatMessage(this.intlMessages.week)}`
          }
        },
        M: `1${intl.formatMessage(this.intlMessages.month)}`,
        MM: `%d${intl.formatMessage(this.intlMessages.month)}`,
        y: `1${intl.formatMessage(this.intlMessages.year)}`,
        yy: `%d${intl.formatMessage(this.intlMessages.year)}`
      }
    }
    const lastMessage = this.getLastMessage(conversation)

    const listing = lastMessage.listingId ? await getListing(lastMessage.listingId, { translate: true }) : {}
    moment.updateLocale(modifiedLanguageCode, localeConfig)
    const createdAt = moment(lastMessage.created).fromNow()
    this.setState({ listing, lastMessage, createdAt })
  }

  componentDidUpdate(prevProps) {
    const { conversation } = this.props

    if (prevProps.conversation !== conversation) {
      this.setState({ lastMessage: this.getLastMessage(conversation) })
    }
  }

  componentWillUnmount() {
    const { modifiedLanguageCode } = this.state
    moment.updateLocale(modifiedLanguageCode, null)
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
      mobileDevice,
      users,
      wallet,
      fromMessages = false
    } = this.props
    const { listing, lastMessage, createdAt } = this.state

    const { content, recipients, senderAddress } = lastMessage
    const role = formattedAddress(senderAddress) === formattedAddress(wallet.address) ? 'sender' : 'recipient'
    const counterpartyAddress =
      role === 'sender'
        ? recipients.find(addr => formattedAddress(addr) !== formattedAddress(senderAddress))
        : senderAddress
    const counterparty =
      users.find(u => formattedAddress(u.address) === formattedAddress(counterpartyAddress)) || {}
    const unreadCount = conversation.values.filter(msg => {
      return msg.status === 'unread' && formattedAddress(msg.senderAddress) !== formattedAddress(wallet.address)
    }).length
    const { profile } = counterparty
    const smallScreen = window.innerWidth <= 991
    const smallScreenOrDevice = smallScreen || mobileDevice
    const conversationItem = smallScreenOrDevice ?
      'mobile-conversation-list-item' : `conversation-list-item${active ? ' active' : ''}`

    return (
      <div
        onClick={handleConversationSelect}
        className={`d-flex message ${conversationItem}`}
      >
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container text-truncate">
          <div className="sender text-truncate">
            <span>{abbreviateName(counterparty) || formattedAddress(counterpartyAddress)}</span>
          </div>
          {(smallScreenOrDevice) && <div className="listing-title text-truncate">{listing.name}</div>}
          <div className={`message text-truncate ${!listing.name ? 'no-listing' : ''}`}>{content}</div>
        </div>
        <div className={`meta-container ${(smallScreenOrDevice)? 'justify-content-start ml-auto' : 'text-right'}`}>
          <div className="timestamp align-self-end">
            {createdAt}
          </div>

          {(!!unreadCount && fromMessages) && (
            <div className="unread count text-right mx-auto">
              <div>{unreadCount}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, users, wallet }) => {
  return {
    mobileDevice: app.mobileDevice,
    selectedLanguageCode: app.translations.selectedLanguageCode,
    users,
    wallet
  }
}

export default connect(mapStateToProps)(injectIntl(ConversationListItem))
