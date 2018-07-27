import $ from 'jquery'
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { dismissMessaging, enableMessaging } from 'actions/App'

import ConversationListItem from 'components/conversation-list-item'

import groupByArray from 'utils/groupByArray'

import origin from '../../services/origin'

const ONE_SECOND = 1000

class MessagesDropdown extends Component {
  constructor(props) {
    super(props)
  }

  componentDidUpdate() {
    const { history, messages, messagingDismissed } = this.props
    const isOnMessagingRoute = history.location.pathname.match(/^\/messages/)
    const hasNewUnreadMessage = messages.find(m => m.created > messagingDismissed)
    const dropdownHidden = !$('.messages.dropdown').hasClass('show')

    if (!isOnMessagingRoute && hasNewUnreadMessage && dropdownHidden) {
      $('#messagesDropdown').dropdown('toggle')
    }
  }

  render() {
    const { history, messages, messagingEnabled } = this.props
    const conversations = groupByArray(messages, 'conversationId')

    return (
      <div className="nav-item messages dropdown">
        <a className="nav-link active dropdown-toggle" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          {!!conversations.length &&
            <div className="unread-indicator"></div>
          }
          {!messagingEnabled &&
            <div className="disabled-indicator"></div>
          }
          <img src="images/messages-icon.svg" className="messages" alt="Messages" />
          <img src="images/messages-icon-selected.svg" className="messages selected" alt="Messages" />
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="messagesDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          {!messagingEnabled &&
            <div className="actual-menu">
              <header className="d-flex">
                <h3 className="m-auto">
                  You need to enable Origin Messaging
                </h3>
              </header>
              <footer>
                <button className="btn btn-sm btn-primary" onClick={this.props.enableMessaging}>Yes, Please</button>
              </footer>
            </div>
          }
          {messagingEnabled &&
            <div className="actual-menu">
              <header className="d-flex">
                <div className="count">
                  <div className="d-inline-block">
                    {messages.length}
                  </div>
                </div>
                <h3>
                  <FormattedMessage
                    id={ 'messagesDropdown.messagesHeading' }
                    defaultMessage={ 'Unread Messages' }
                  />
                </h3>
              </header>
              <div className="messages-list">
                {conversations.map(c => <ConversationListItem key={c.key} conversation={c} active={false} handleConversationSelect={() => history.push(`/messages/${c.key}`)} />)}
              </div>
              <Link to="/messages">
                <footer>
                  <FormattedMessage
                    id={ 'messagesDropdown.viewAll' }
                    defaultMessage={ 'View All' }
                  />
                </footer>
              </Link>
            </div>
          }
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    messagingDismissed: state.app.messagingDismissed,
    messagingEnabled: state.app.messagingEnabled,
    messages: state.messages.filter(({ senderAddress, status }) => {
      return status === 'unread' && senderAddress !== state.app.web3.account
    }),
  }
}

const mapDispatchToProps = dispatch => ({
  dismissMessaging: () => dispatch(dismissMessaging()),
  enableMessaging: () => dispatch(enableMessaging()),
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(MessagesDropdown))
