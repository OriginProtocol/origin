import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import Avatar from 'components/avatar'

class ConversationListItem extends Component {
  render() {
    const {
      active,
      conversation,
      handleConversationSelect,
      users,
      web3Account,
      mobileDevice,
      listing = {}
    } = this.props
    const lastMessage = conversation.values.sort(
      (a, b) => (a.created < b.created ? -1 : 1)
    )[conversation.values.length - 1]
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

    if (mobileDevice) {
      return (
        <div
          onClick={handleConversationSelect}
          className={`d-flex message mobile-conversation-list-item`}
        >
          <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
          <div className="content-container text-truncate">
            <div className="sender text-truncate">
              <span>{counterparty.fullName || counterpartyAddress}</span>
            </div>
            <div className="message text-truncate">{listing.name}</div>
            <div className="message text-truncate">{content}</div>
          </div>
          <div className="meta-container">
            <div className="timestamp ml-auto">
              {moment(created).format('h:mm a')}
            </div>
            {!!unreadCount && (
              <div className="unread count text-center">
                <div>{unreadCount}</div>
              </div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div
        onClick={handleConversationSelect}
        className={`d-flex conversation-list-item${active ? ' active' : ''}`}
      >
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container text-truncate">
          <div className="sender text-truncate">
            {counterparty.fullName || counterpartyAddress}
          </div>
          <div className="message text-truncate">{content}</div>
        </div>
        <div className="meta-container text-right">
          {!!unreadCount && (
            <div className="unread count text-right">
              <div className="d-inline-block">{unreadCount}</div>
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
