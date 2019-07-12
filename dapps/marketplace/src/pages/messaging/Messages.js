import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withIsMobile from 'hoc/withIsMobile'
import withMessaging from 'hoc/withMessaging'
import query from 'queries/Conversations'
import MarkConversationRead from 'mutations/MarkConversationRead'

import RoomStatus from './RoomStatus'
import Room from './Room'
import QueryError from 'components/QueryError'
import Avatar from 'components/Avatar'
import DocumentTitle from 'components/DocumentTitle'

import MobileModal from 'components/MobileModal'

import { abbreviateName, truncateAddress } from 'utils/user'

class Messages extends Component {
  constructor(props) {
    super(props)

    this.state = { defaultRoomSet: false, back: false }
  }

  componentDidUpdate() {
    const room = get(this.props, 'match.params.room')

    if (
      this.state.defaultRoomSet ||
      this.state.back ||
      !this.props.messaging ||
      room ||
      this.props.isMobile
    ) {
      return
    }

    const conversations = this.getSortedConversations()

    const defaultRoom = get(conversations, '0.id')

    if (defaultRoom) {
      this.props.history.push(`/messages/${defaultRoom}`)
      this.setState({
        defaultRoomSet: true
      })
    }
  }

  getSortedConversations() {
    return get(this.props, 'messaging.conversations', [])
      .sort((a, b) => {
        const alm = a.lastMessage || { timestamp: Date.now() }
        const blm = b.lastMessage || { timestamp: Date.now() }

        return alm.timestamp > blm.timestamp ? -1 : 1
      })
      .filter(
        conv =>
          conv.id !== this.props.wallet && conv.id !== this.props.walletProxy
      )
  }

  goBack() {
    this.setState({
      back: true
    })
    this.props.history.goBack()
  }

  renderRoom({ room, enabled }) {
    if (!room) {
      return null
    }

    return (
      <Mutation mutation={MarkConversationRead}>
        {markConversationRead => (
          <div className="conversation-view">
            <Room id={room} markRead={markConversationRead} enabled={enabled} />
          </div>
        )}
      </Mutation>
    )
  }

  renderContent() {
    const {
      isMobile,
      wallet,
      identity,
      messagingError,
      messaging,
      messagingLoading
    } = this.props

    if (messagingError) {
      return <QueryError query={query} error={messagingError} />
    } else if (messagingLoading) {
      return (
        <div>
          <fbt desc="Messages.loading">Loading conversations...</fbt>
        </div>
      )
    } else if (!messaging) {
      return (
        <p className="p-3">
          <fbt desc="Messages.cannotQuery">Cannot query messages</fbt>
        </p>
      )
    }

    const conversations = this.getSortedConversations()

    const room = get(this.props, 'match.params.room')

    let content = this.renderRoom({ room, enabled: messaging.enabled })

    if (content && isMobile) {
      content = (
        <MobileModal
          className="messages-page messages-modal"
          title={
            <Link to={`/user/${wallet}`} className="user-profile-link">
              <Avatar profile={identity} size={30} />
              <span className="counterparty">
                {abbreviateName(identity) || truncateAddress(wallet)}
              </span>
            </Link>
          }
          onBack={() => this.goBack()}
        >
          <div className="conversations-wrapper">{content}</div>
        </MobileModal>
      )
    }

    return (
      <div className="conversations-wrapper">
        <div className={`conversations-list`}>
          {conversations.length ? null : (
            <div>
              <fbt desc="Messages.none">No conversations!</fbt>
            </div>
          )}
          {conversations.map((conv, idx) => (
            <RoomStatus
              key={idx}
              active={room === conv.id}
              conversation={conv}
              wallet={conv.id}
              onClick={() => {
                this.props.history.push(`/messages/${conv.id}`)
              }}
            />
          ))}
        </div>
        {content}
      </div>
    )
  }

  render() {
    return (
      <div className="container messages-page">
        <DocumentTitle pageTitle={<fbt desc="Messages.title">Messages</fbt>} />
        {this.renderContent()}
      </div>
    )
  }
}

export default withIsMobile(withWallet(withIdentity(withMessaging(Messages))))

require('react-styl')(`
  .messages-page
    margin-top: 1rem
    .back
      background-color: var(--dusk)
      height: 60px
      width: 100%
      margin-bottom: 10px
      margin-top: -16px

      .avatar
        margin: 0 10px 12px auto
        align-self: center
        display: inline-block
        vertical-align: bottom
      .avatar-container
        height: 30px
        width: 30px

      i
        width: 18px
        height: 18px
        border-radius: 3px
        border: solid white
        border-width: 0 4px 4px 0
        display: inline-block
        padding: 3px

        &.icon-arrow-left
          margin-left: 18px
          margin-top: 20px
          transform: rotate(135deg)
          -webkit-transform: rotate(135deg)

      .counterparty
        margin-right: auto
        font-size: 22px
        font-weight: bold
        color: white
        margin-bottom: 5px
        width: 200px
        text-align: left
        line-height: 57px

      a
        color: white

      &:hover
        color: white

    .conversations-wrapper
      display: flex
      flex-direction: row
      height: calc(100vh - 6rem)
      .conversations-list
        flex: 1
        overflow-y: scroll
        overflow-x: hidden
      .conversation-view
        flex: 3
        overflow-y: scroll
        overflow-x: hidden
        padding: 0 2rem
        display: flex
        flex-direction: column

  .mobile-modal-light
    .messages-modal
      margin: 0
      &.modal-content
        min-height: auto
        .messages
          padding: 0 1rem
        .send-message
          margin-bottom: 1rem
          padding: 1rem 1rem 0rem 1rem
          margin-top: auto
      
        .conversations-wrapper
          height: 100%
          flex: 1
        .conversation-view
          padding: 0
      &.modal-header
        .user-profile-link
          display: inline-block
          .avatar
            display: inline-block
            vertical-align: middle
            margin-right: 0.5rem

`)
