import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import queryString from 'query-string'

import ConversationListItem from 'components/conversation-list-item'
import Conversation from 'components/conversation'
import Avatar from 'components/avatar'

import { showMainNav } from 'actions/App'

import groupByArray from 'utils/groupByArray'
import { abbreviateName, truncateAddress, formattedAddress } from 'utils/user'

import origin from '../services/origin'

class Messages extends Component {
  constructor(props) {
    super(props)

    this.checkForSmallScreen = this.checkForSmallScreen.bind(this)

    this.state = {
      selectedConversationId: null,
      smallScreenOrDevice: false
    }
  }

  componentDidMount() {
    const { match } = this.props
    const smallSreenDetected = this.checkForSmallScreen()

    // try to detect the conversation before rendering
    if (match.params.conversationId || !smallSreenDetected) {
      this.detectSelectedConversation()
    }

    window.addEventListener('resize', this.checkForSmallScreen)

    const { location } = this.props
    const query = queryString.parse(location.search)
    const walletContainer = query['wallet-container']
    if (walletContainer && origin.contractService.walletLinker) {
      window.__setWalletMessaging = (messageAccount, messageKeys) => {
        origin.contractService.currentAccount = async () => {
          return messageAccount
        }
        origin.contractService.web3.eth.getAccounts = async (callback) => {
          if (callback) {
            callback(undefined, [messageAccount])
          }
          return [messageAccount]
        }
        origin.contractService.web3.isOrigin = false
        origin.messaging.onPreGenKeys(messageKeys)
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { conversations, match } = this.props
    const { selectedConversationId, smallScreenOrDevice } = this.state
    const { conversationId } = match.params

    if (smallScreenOrDevice) return

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

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkForSmallScreen)
  }

  checkForSmallScreen() {
    const { mobileDevice, showMainNav, selectedConversationId } = this.props

    const smallScreen = window.innerWidth <= 991
    const smallScreenOrDevice = smallScreen || mobileDevice
    const stateChanged = (this.state && this.state.smallScreenOrDevice)

    if (smallScreenOrDevice && selectedConversationId && !stateChanged) {
      showMainNav(false)
    }
    this.setState({ smallScreenOrDevice })

    return smallScreenOrDevice
  }

  detectSelectedConversation() {
    const { match, conversations, showMainNav } = this.props
    const { smallScreenOrDevice } = this.state

    const selectedConversationId =
      match.params.conversationId ||
      (conversations[0] || {}).key

    if (smallScreenOrDevice && selectedConversationId) showMainNav(false)
    selectedConversationId && this.setState({ selectedConversationId })
  }

  handleConversationSelect(selectedConversationId = '') {
    const { smallScreenOrDevice } = this.state
    const showMainNav = (smallScreenOrDevice && selectedConversationId.length) ? false : true

    this.props.showMainNav(showMainNav)
    this.setState({ selectedConversationId })
  }

  render() {
    const { conversations, location, messages, users, wallet } = this.props
    const { selectedConversationId, smallScreenOrDevice } = this.state
    const filteredAndSorted = messages
      .filter(m => m.conversationId === selectedConversationId)
      .sort((a, b) => (a.created < b.created ? -1 : 1))
    const conversation = conversations.find((conv) => conv.key === selectedConversationId)
    const lastMessage = conversation && conversation.values.sort(
      (a, b) => (a.created < b.created ? -1 : 1)
    )[conversation.values.length - 1]
    const { recipients, senderAddress } = lastMessage || { recipients: [] }
    const role = formattedAddress(senderAddress) === formattedAddress(wallet.address) ? 'sender' : 'recipient'
    const counterpartyAddress =
      role === 'sender'
        ? recipients.find(addr => formattedAddress(addr) !== formattedAddress(senderAddress))
        : senderAddress
    const counterparty = users.find(u => formattedAddress(u.address) === formattedAddress(counterpartyAddress)) || {}
    const counterpartyProfile = counterparty && counterparty.profile
    const counterpartyName = abbreviateName(counterparty) || truncateAddress(formattedAddress(counterpartyAddress))
    const query = queryString.parse(location.search)
    const includeNav = !query['no-nav']

    if (smallScreenOrDevice) {
      if (selectedConversationId && selectedConversationId.length) {
        return (
          <div className="mobile-messaging messages-wrapper">
            <div className="back d-flex flex-row justify-content-start">
              <div className="align-self-start">
                <i className="icon-arrow-left align-self-start mr-auto" onClick={() => this.handleConversationSelect()}></i>
              </div>
              <div className="align-self-center nav-avatar ml-auto">
                {includeNav && (
                  <Link to={`/users/${counterpartyAddress}`}>
                    <Avatar image={counterpartyProfile && counterpartyProfile.avatar} placeholderStyle="blue" />
                  </Link>
                )}
                {!includeNav && (
                  <Avatar image={counterpartyProfile && counterpartyProfile.avatar} placeholderStyle="blue" />
                )}
              </div>
              <div className="counterparty text-truncate mr-auto">
                {includeNav && (
                  <Link to={includeNav ? `/users/${counterpartyAddress}` : '#'}>
                    {counterpartyName}
                  </Link>
                )}
                {!includeNav && counterpartyName}
              </div>
            </div>
            <div className="conversation-col d-flex flex-column">
              <Conversation
                id={selectedConversationId}
                includeNav={includeNav}
                messages={filteredAndSorted}
                withListingSummary={true}
                smallScreenOrDevice={smallScreenOrDevice}
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
                fromMessages={true}
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
                    fromMessages={true}
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

const mapStateToProps = ({ activation, app, messages, users, wallet }) => {
  const { mobileDevice, showNav } = app
  const filteredMessages = messages.filter(({ content, conversationId }) => {
    return (
      content &&
      origin.messaging.getRecipients(conversationId).includes(wallet.address)
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
    messagingEnabled: activation.messaging.enabled,
    mobileDevice,
    showNav,
    users,
    wallet
  }
}

const mapDispatchToProps = dispatch => ({
  showMainNav: (showNav) => dispatch(showMainNav(showNav)),
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Messages)
)
