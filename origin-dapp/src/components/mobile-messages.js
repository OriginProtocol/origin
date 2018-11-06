import React, { Component } from 'react'
import ConversationListItem from 'components/conversation-list-item'

export default class MobileMessaging extends Component {
  render() {
    const { selectedConversationId, conversations } = this.props

    return (
      <div className="d-flex messages-wrapper">
        <div className="conversations-list-col">
          {conversations.map(c => (
              <ConversationListItem
                key={c.key}
                conversation={c}
                active={selectedConversationId === c.key}
                handleConversationSelect={() =>
                this.handleConversationSelect(c.key)
              }
              />
            )
          )}
        </div>
      </div>
    )
  }
}
