import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import ConversationListItem from 'components/conversation-list-item'
import Conversation from 'components/conversation'

import groupByArray from 'utils/groupByArray'

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

  componentDidUpdate(prevProps, prevState) {
    const { conversations, match, messages } = this.props
    const { selectedConversationId } = this.state
    const { conversationId } = match.params
    const changedSelectedConversationId = selectedConversationId !== prevState.selectedConversationId

    // on route change
    if (conversationId && conversationId !== prevProps.match.params.conversationId) {
      this.detectSelectedConversation()
    }

    // autoselect a conversation if none exists
    if (!selectedConversationId && conversations.length) {
      this.detectSelectedConversation()
    }
  }

  detectSelectedConversation() {
    const selectedConversationId = this.props.match.params.conversationId || (this.props.conversations[0] || {}).key

    selectedConversationId && this.setState({ selectedConversationId })
  }

  handleConversationSelect(selectedConversationId) {
    this.setState({ selectedConversationId })
  }

  render() {
    const { conversations, messages } = this.props
    const { selectedConversationId } = this.state
    const filteredAndSorted = messages
                              .filter(m => m.conversationId === selectedConversationId)
                              .sort((a, b) => (a.index < b.index ? -1 : 1))

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
                    handleConversationSelect={() => this.handleConversationSelect(c.key)}
                  />
                )
              })}
            </div>
            <Conversation
              id={selectedConversationId}
              messages={filteredAndSorted}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    conversations: groupByArray(state.messages, 'conversationId'),
    messages: state.messages,
    messagingEnabled: state.app.messagingEnabled,
    web3Account: state.app.web3.account
  }
}

export default withRouter(connect(mapStateToProps)(Messages))
