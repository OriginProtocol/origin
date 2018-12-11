import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'

import { enableMessaging } from 'actions/Activation'
import { dismissMessaging, storeWeb3Intent } from 'actions/App'

import ConversationListItem from 'components/conversation-list-item'
import Dropdown from 'components/dropdown'

import groupByArray from 'utils/groupByArray'
import { formattedAddress } from 'utils/user'

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

    this.state = { open: false }
  }

  componentDidUpdate() {
    const { history, messages, messagingDismissed } = this.props
    const isOnMessagingRoute = !!history.location.pathname.match(/^\/messages/)
    const hasNewUnreadMessage = messages.find(
      m => m.created > messagingDismissed
    )

    if (!isOnMessagingRoute && hasNewUnreadMessage && !this.state.forceOpen) {
      this.setState({ open: true, forceOpen: true })
    }
  }

  handleClick() {
    const { intl, storeWeb3Intent, wallet } = this.props

    if (!wallet.address) {
      storeWeb3Intent(intl.formatMessage(this.intlMessages.viewMessages))
    }

    this.toggle('close')
  }

  handleEnable() {
    const { enableMessaging, intl, storeWeb3Intent, wallet } = this.props

    if (wallet.address) {
      enableMessaging()
    } else {
      storeWeb3Intent(intl.formatMessage(this.intlMessages.enableMessaging))
    }
  }

  toggle(state) {
    const open = state === 'close' ? false : !this.state.open
    if (!open) {
      this.props.dismissMessaging()
    }
    this.setState({ open })
  }

  render() {
    const { conversations, history, messages, messagingEnabled, wallet } = this.props
    const { open } = this.state

    return (
      <Dropdown
        className="nav-item messages"
        open={open}
        onClose={() => this.setState({ open: false })}
      >
        <a
          className="nav-link active dropdown-toggle"
          id="messagesDropdown"
          role="button"
          onClick={() => this.toggle()}
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
          className={`dropdown-menu dropdown-menu-right${open ? ' show' : ''}`}
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
              {!messagingEnabled &&
                <button className="btn btn-sm btn-primary d-none d-md-block ml-auto" onClick={() => {
                  this.handleEnable()

                  if (!wallet.address) {
                    this.props.storeWeb3Intent('Enable messaging.')
                    origin.contractService.showLinkPopUp()
                  }
                }}
                  ga-category="messaging"
                  ga-label="messaging_dropdown_enable"
                >
                  <FormattedMessage
                    id={'messages.enable'}
                    defaultMessage={'Enable Messaging'}
                  />
                </button>
              }
            </header>
            <div className="messages-list">
              {conversations.map(c => (
                <ConversationListItem
                  key={c.key}
                  conversation={c}
                  active={false}
                  handleConversationSelect={() => {
                    history.push(`/messages/${c.key}`)
                    this.toggle('close')
                  }}
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
      </Dropdown>
    )
  }
}

const mapStateToProps = ({ activation, app, messages, wallet }) => {
  const filteredMessages = messages.filter(
    ({ content, conversationId, senderAddress, status }) => {
      return (
        content &&
        status === 'unread' &&
        formattedAddress(senderAddress) !== formattedAddress(wallet.address) &&
        origin.messaging.getRecipients(conversationId).includes(wallet.address)
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
    messagingDismissed: app.messagingDismissed,
    messagingEnabled: activation.messaging.enabled,
    wallet,
    web3Intent: web3.intent
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
