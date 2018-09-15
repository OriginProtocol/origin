import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import { dismissMessaging, enableMessaging } from 'actions/App'
import { storeWeb3Intent } from 'actions/App'

import ConversationListItem from 'components/conversation-list-item'

import groupByArray from 'utils/groupByArray'

class MessagesDropdown extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.storeWeb3Intent = this.storeWeb3Intent.bind(this)
  }

  componentDidMount() {
    $(document).on('click', '.messages .dropdown-menu', e => {
      e.stopPropagation()
    })

    $('.messages.dropdown').on('show.bs.dropdown', this.storeWeb3Intent)
    $('.messages.dropdown').on('hide.bs.dropdown', this.props.dismissMessaging)
  }

  componentDidUpdate() {
    const { history, messages, messagingDismissed } = this.props
    const isOnMessagingRoute = !!history.location.pathname.match(/^\/messages/)
    const hasNewUnreadMessage = messages.find(
      m => m.created > messagingDismissed
    )
    const dropdownHidden = !$('.messages.dropdown').hasClass('show')

    if (!isOnMessagingRoute && hasNewUnreadMessage && dropdownHidden) {
      $('#messagesDropdown').dropdown('toggle')
    }
  }

  handleClick() {
    $('#messagesDropdown').dropdown('toggle')
  }

  storeWeb3Intent() {
    this.props.storeWeb3Intent('view messages')
  }

  render() {
    const { enableMessaging, history, messages, messagingEnabled, web3Account } = this.props
    const conversations = groupByArray(messages, 'conversationId')

    return (
      <div className="nav-item messages dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="messagesDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          {!!conversations.length && <div className="unread-indicator" />}
          {!messagingEnabled && <div className="disabled-indicator" />}
          <img
            src="images/messages-icon.svg"
            className="messages"
            alt="Messages"
          />
          <img
            src="images/messages-icon-selected.svg"
            className="messages selected"
            alt="Messages"
          />
        </a>
        {web3.givenProvider && web3Account && (
          <div
            className="dropdown-menu dropdown-menu-right"
            aria-labelledby="messagesDropdown"
          >
            <div className="triangle-container d-flex justify-content-end">
              <div className="triangle" />
            </div>
            <div className="actual-menu">
              <header className="d-flex">
                <div className="count">
                  <div className="d-inline-block">{messages.length}</div>
                </div>
                <h3>
                  {messages.length === 1 && (
                    <FormattedMessage
                      id={'messagesDropdown.messageHeading'}
                      defaultMessage={'Unread Message'}
                    />
                  )}
                  {messages.length !== 1 && (
                    <FormattedMessage
                      id={'messagesDropdown.messagesHeading'}
                      defaultMessage={'Unread Messages'}
                    />
                  )}
                </h3>
                {!messagingEnabled && (
                  <button
                    className="btn btn-sm btn-primary d-none d-md-block ml-auto"
                    onClick={enableMessaging}
                  >
                    <FormattedMessage
                      id={'messages.enable'}
                      defaultMessage={'Enable Messaging'}
                    />
                  </button>
                )}
              </header>
              <div className="messages-list">
                {conversations.map(c => (
                  <ConversationListItem
                    key={c.key}
                    conversation={c}
                    active={false}
                    handleConversationSelect={() =>
                      history.push(`/messages/${c.key}`)
                    }
                  />
                ))}
              </div>
              <Link to="/messages" onClick={this.handleClick}>
                <footer>
                  <FormattedMessage
                    id={'messagesDropdown.viewAll'}
                    defaultMessage={'View All'}
                  />
                </footer>
              </Link>
            </div>
          </div>
        )}
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
    web3Account: state.app.web3.account
  }
}

const mapDispatchToProps = dispatch => ({
  dismissMessaging: () => dispatch(dismissMessaging()),
  enableMessaging: () => dispatch(enableMessaging()),
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessagesDropdown)
)
