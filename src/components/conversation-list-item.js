import React, { Component } from 'react'
import { connect } from 'react-redux'

import Avatar from './avatar'
import Timelapse from './timelapse'

import origin from '../services/origin'

class ConversationListItem extends Component {
  render() {
    const { active, conversation, handleConversationSelect, key, web3Account } = this.props
    const lastMessage = conversation.values.sort((a, b) => a.created < b.created ? -1 : 1)[conversation.values.length - 1]
    const { content, created, fromName, recipients, senderAddress, toName } = lastMessage
    const role = senderAddress === web3Account ? 'sender' : 'recipient'
    const counterparty = role === 'sender' ? {
      address: recipients.find(addr => addr !== senderAddress),
      name: toName,
    } : {
      address: senderAddress,
      name: fromName,
    }
    const unreadCount = conversation.values.filter(m => !m.readAt).length

    return (
      <div
        onClick={handleConversationSelect}
        className={`d-flex conversation-list-item${active ? ' active' : ''}`}
      >
        <Avatar placeholderStyle="blue" />
        <div className="content-container text-truncate">
          <div className="sender text-truncate">
            {counterparty.name || counterparty.address}
          </div>
          <div className="message text-truncate">
            {content}
          </div>
        </div>
        <div className="meta-container text-right">
          <div className="time-reference text-right">
            <Timelapse abbreviated={true} reactive={false} reference={created} />
          </div>
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
    web3Account: state.app.web3.account,
  }
}

export default connect(mapStateToProps)(ConversationListItem)
