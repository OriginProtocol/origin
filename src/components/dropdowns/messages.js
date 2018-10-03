import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import { dismissMessaging, enableMessaging, storeWeb3Intent } from 'actions/App'

import ConversationListItem from 'components/conversation-list-item'

import groupByArray from 'utils/groupByArray'

import origin from '../../services/origin'

class MessagesDropdown extends Component {
  constructor(props) {
    super(props)

    this.handleClick = this.handleClick.bind(this)
    this.handleEnable = this.handleEnable.bind(this)

    this.intlMessages = defineMessages({
      enableMessaging: {
        id: 'messagesDropdown.enableMessaging',
        defaultMessage: 'enable messaging'
      },
      viewMessages: {
        id: 'messagesDropdown.viewMessages',
        defaultMessage: 'view your messages'
      }
    })
  }

  componentDidMount() {
    $(document).on('click', '.messages .dropdown-menu', e => {
      e.stopPropagation()
    })

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
    const { intl, storeWeb3Intent, web3Account } = this.props

    if (!web3Account) {
      storeWeb3Intent(intl.formatMessage(this.intlMessages.viewMessages))
    }

    $('#messagesDropdown').dropdown('toggle')
  }

  handleEnable() {
    const { enableMessaging, intl, storeWeb3Intent, web3Account } = this.props

    if (web3Account) {
      enableMessaging()
    } else {
      storeWeb3Intent(intl.formatMessage(this.intlMessages.enableMessaging))
    }
  }

  render() {
    const { conversations, history, messages, messagingEnabled } = this.props

    return (
      <div className="nav-item messages dropdown">
        <a
          className="nav-link active dropdown-toggle"
          id="messagesDropdown"
          role="button"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
          ga-category="top_nav"
          ga-label="messaging"
        >
          {!!conversations.length && <div className="unread-indicator" />}
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
                  onClick={this.handleEnable}
                  ga-category="messaging"
                  ga-label="messaging_dropdown_enable"
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
            <Link
              to="/messages"
              onClick={this.handleClick}
              ga-category="messaging"
              ga-label="messaging_dropdown_view_all"
            >
              <footer>
                <FormattedMessage
                  id={'messagesDropdown.viewAll'}
                  defaultMessage={'View All'}
                />
              </footer>
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = ({ app, messages }) => {
  const { messagingDismissed, messagingEnabled, web3 } = app
  const web3Account = web3.account
  const filteredMessages = messages.filter(
    ({ content, conversationId, senderAddress, status }) => {
      return (
        content &&
        status === 'unread' &&
        senderAddress !== web3Account &&
        origin.messaging.getRecipients(conversationId).includes(web3Account)
      )
    }
  )
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
    messagingDismissed,
    messagingEnabled,
    web3Account
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
  )(injectIntl(MessagesDropdown))
)
