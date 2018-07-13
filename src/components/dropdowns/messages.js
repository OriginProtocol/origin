import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import groupByArray from 'utils/groupByArray'

import ConversationListItem from '../conversation-list-item'

class MessagesDropdown extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { conversations, history } = this.props

    return (
      <div className="nav-item messages dropdown">
        <a className="nav-link active dropdown-toggle" id="messagesDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <div className="unread-indicator"></div>
          <img src="images/messages-icon.svg" className="messages" alt="Messages" />
          <img src="images/messages-icon-selected.svg" className="messages selected" alt="Messages" />
        </a>
        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="messagesDropdown">
          <div className="triangle-container d-flex justify-content-end"><div className="triangle"></div></div>
          <div className="actual-menu">
            <header className="d-flex">
              <div className="count">
                <div className="d-inline-block">0</div>
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
            <footer>
              <Link to="/messages">
                <FormattedMessage
                  id={ 'messagesDropdown.viewAll' }
                  defaultMessage={ 'View All' }
                />
              </Link>
            </footer>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    conversations: groupByArray(state.messages, 'conversationId'),
  }
}

export default withRouter(connect(mapStateToProps)(MessagesDropdown))
