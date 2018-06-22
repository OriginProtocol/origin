import React, { Component } from 'react'
import { connect } from 'react-redux'

import Avatar from './avatar'
import Timelapse from './timelapse'

class DialogueListItem extends Component {
  render() {
    const { active, dialogue, handleDialogueSelect, key, web3Account } = this.props
    const lastMessage = dialogue.values.sort((a, b) => a.createdAt < b.createdAt ? -1 : 1)[dialogue.values.length - 1]
    const { content, createdAt, fromAddress, fromName, toAddress, toName } = lastMessage
    const role = fromAddress === web3Account ? 'sender' : 'recipient'
    const counterparty = role === 'sender' ? {
      address: toAddress,
      name: toName,
    } : {
      address: fromAddress,
      name: fromName,
    }
    const unreadCount = dialogue.values.filter(m => !m.readAt).length

    return (
      <div
        onClick={handleDialogueSelect}
        className={`d-flex dialogue-list-item${active ? ' active' : ''}`}
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
            <Timelapse abbreviated={true} reactive={false} reference={createdAt} />
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

export default connect(mapStateToProps)(DialogueListItem)
