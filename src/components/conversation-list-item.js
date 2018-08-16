import React, { Component } from 'react'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'

import { fetchUser } from 'actions/User'

import Avatar from 'components/avatar'

class ConversationListItem extends Component {
  constructor(props) {
    super(props)

    this.preFetchUsers = this.preFetchUsers.bind(this)

    this.intlMessages = defineMessages({
      unnamedUser: {
        id: 'conversation-list-item.unnamedUser',
        defaultMessage: 'Unnamed User'
      }
    })
  }

  componentDidMount() {
    this.preFetchUsers()
  }

  componentDidUpdate() {
    this.preFetchUsers()
  }

  preFetchUsers() {
    const { conversation, fetchUser, intl, users } = this.props
    const { recipients, senderAddress } = conversation.values[0]
    const addresses = [...recipients, senderAddress]

    addresses
      .filter(addr => {
        return !users.find(({ address }) => {
          return address === addr
        })
      })
      .forEach(addr => {
        fetchUser(addr, intl.formatMessage(this.intlMessages.unnamedUser))
      })
  }

  render() {
    const {
      active,
      conversation,
      handleConversationSelect,
      users,
      web3Account
    } = this.props
    const lastMessage = conversation.values.sort(
      (a, b) => (a.created < b.created ? -1 : 1)
    )[conversation.values.length - 1]
    const { content, recipients, senderAddress } = lastMessage
    const role = senderAddress === web3Account ? 'sender' : 'recipient'
    const counterpartyAddress =
      role === 'sender'
        ? recipients.find(addr => addr !== senderAddress)
        : senderAddress
    const counterparty =
      users.find(u => u.address === counterpartyAddress) || {}
    const unreadCount = conversation.values.filter(msg => {
      return msg.status === 'unread' && msg.senderAddress !== web3Account
    }).length
    const { profile } = counterparty

    return (
      <div
        onClick={handleConversationSelect}
        className={`d-flex conversation-list-item${active ? ' active' : ''}`}
      >
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container text-truncate">
          <div className="sender text-truncate">
            {counterparty.fullName || counterpartyAddress}
          </div>
          <div className="message text-truncate">{content}</div>
        </div>
        <div className="meta-container text-right">
          {!!unreadCount && (
            <div className="unread count text-right">
              <div className="d-inline-block">{unreadCount}</div>
            </div>
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    users: state.users,
    web3Account: state.app.web3.account
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: (addr, msg) => dispatch(fetchUser(addr, msg))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConversationListItem))
