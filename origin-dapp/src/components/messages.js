import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import ConversationListItem from 'components/conversation-list-item'
import Conversation from 'components/conversation'

import groupByArray from 'utils/groupByArray'

import origin from '../services/origin'

class Messages extends Component {
  constructor(props) {
    super(props)

    this.state = {
      selectedConversationId: ''
    }
  }

  componentDidMount() {
    // try to detect the conversation before rendering
    this.detectSelectedConversation()
  }

  componentDidUpdate(prevProps) {
    const { conversations, match, isMobile } = this.props
    const { selectedConversationId } = this.state
    const { conversationId } = match.params

    if (!isMobile) {
      // on route change
      if (
        conversationId &&
        conversationId !== prevProps.match.params.conversationId
      ) {
        this.detectSelectedConversation()
      }

      // autoselect a conversation if none exists
      if (!selectedConversationId && conversations.length) {
        this.detectSelectedConversation()
      }
    }
  }

  detectSelectedConversation() {
    const selectedConversationId =
      this.props.match.params.conversationId ||
      (this.props.conversations[0] || {}).key

    selectedConversationId && this.setState({ selectedConversationId })
  }

  handleConversationSelect(selectedConversationId) {
    this.setState({ selectedConversationId })
  }

  render() {
    const { conversations, messages, isMobile } = this.props
    const { selectedConversationId } = this.state
    const filteredAndSorted = messages
      .filter(m => m.conversationId === selectedConversationId)
      .sort((a, b) => (a.created < b.created ? -1 : 1))

    if (isMobile) {
      if (selectedConversationId) {
        return (
          <div className="mobile-messaging">
            <div className="back" onClick={() => this.handleConversationSelect('')}>
              <span>&#60; Back</span>
            </div>
            <div className="conversation-col col-12 col-sm-8 col-lg-9 d-flex flex-column">
              <Conversation
                id={selectedConversationId}
                messages={filteredAndSorted}
                withListingSummary={true}
              />
            </div>
          </div>
        )
      } else {
        return (
          <div className="mobile-conversations">
            {conversations.map(c => (
              <ConversationListItem
                key={c.key}
                conversation={c}
                active={selectedConversationId === c.key}
                handleConversationSelect={() =>
                  this.handleConversationSelect(c.key)
                }
              />
            ))}
          </div>
        )
      }
    }

    return (
      <div className="d-flex messages-wrapper">
        <div className="container">
          <div className="row no-gutters">
            <div className="conversations-list-col col-12 col-sm-4 col-lg-3 d-flex d-sm-block">
              {conversations.map(c => {
                return (
                  <ConversationListItem
                    key={c.key}
                    conversation={c}
                    active={selectedConversationId === c.key}
                    handleConversationSelect={() =>
                      this.handleConversationSelect(c.key)
                    }
                  />
                )
              })}
            </div>
            <div className="conversation-col col-12 col-sm-8 col-lg-9 d-flex flex-column">
              <Conversation
                id={selectedConversationId}
                messages={filteredAndSorted}
                withListingSummary={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, messages }) => {
  const { messagingEnabled, web3, isMobile } = app
  const web3Account = web3.account
  const filteredMessages = messages.filter(({ content, conversationId }) => {
    return (
      content &&
      origin.messaging.getRecipients(conversationId).includes(web3Account)
    )
  })
  const conversations = groupByArray(filteredMessages, 'conversationId')
  const sortedConversations = conversations.sort((a, b) => {
    const lastMessageA = a.values.sort(
      (c, d) => (c.created < d.created ? -1 : 1)
    )[a.values.length - 1]
    const lastMessageB = b.values.sort(
      (c, d) => (c.created < d.created ? -1 : 1)
    )[b.values.length - 1]

    return lastMessageA.created > lastMessageB.created ? -1 : 1
  })

  return {
    conversations: sortedConversations,
    messages: filteredMessages,
    messagingEnabled,
    web3Account,
    isMobile
  }
}

export default withRouter(connect(mapStateToProps)(Messages))
