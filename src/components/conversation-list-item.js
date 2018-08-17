import React, { Component } from 'react'
import { connect } from 'react-redux'

import Avatar from 'components/avatar'

import origin from '../services/origin'

class ConversationListItem extends Component {
  render() {
    const { active, conversation, handleConversationSelect, key, users, web3Account } = this.props
    const lastMessage = conversation.values.sort((a, b) => a.created < b.created ? -1 : 1)[conversation.values.length - 1]
    const { content, created, recipients, senderAddress } = lastMessage
    const role = senderAddress === web3Account ? 'sender' : 'recipient'
    const counterpartyAddress = role === 'sender' ? 
      recipients.find(addr => addr !== senderAddress) :
      senderAddress
    const counterparty = users.find(u => u.address === counterpartyAddress) || {}
    const unreadCount = conversation.values.filter(msg => {
      return msg.status === 'unread' && msg.senderAddress !== web3Account
    }).length
    const { fullName, profile } = counterparty

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
          <div className="message text-truncate">
            {content}
          </div>
        </div>
        <div className="meta-container text-right">
          {!!unreadCount &&
            <div className="unread count text-right">
              <div className="d-inline-block">{unreadCount}</div>
            </div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users,
    web3Account: state.app.web3.account,
  }
}

export default connect(mapStateToProps)(ConversationListItem)
