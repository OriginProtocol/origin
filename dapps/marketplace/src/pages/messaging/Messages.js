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

    const conversations = get(this.props, 'messaging.conversations', []).sort(
      (a, b) => {
        const alm = a.lastMessage || { timestamp: Date.now() }
        const blm = b.lastMessage || { timestamp: Date.now() }

        return alm.timestamp > blm.timestamp ? -1 : 1
      }
    )

    const defaultRoom = get(conversations, '0.id')

    if (defaultRoom) {
      this.props.history.push(`/messages/${defaultRoom}`)
      this.setState({
        defaultRoomSet: true
      })
    }
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
          <Room id={room} markRead={markConversationRead} enabled={enabled} />
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

    const conversations = get(messaging, 'conversations', []).sort((a, b) => {
      const alm = a.lastMessage || { timestamp: Date.now() }
      const blm = b.lastMessage || { timestamp: Date.now() }

      return alm.timestamp > blm.timestamp ? -1 : 1
    })

    const room = get(this.props, 'match.params.room')

    let content = this.renderRoom({ room, enabled: messaging.enabled })

    if (content && isMobile) {
      content = (
        <MobileModal
          className="messages-modal"
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
          {content}
        </MobileModal>
      )
    } else if (!isMobile) {
      content = <div className="col-md-9">{content}</div>
    }

    return (
      <div className="row">
        <div className={`col-md-3 d-md-block`}>
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
        <div className="col-md-9">{content}</div>
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

  .mobile-modal-light
    .messages-modal
      &.modal-content
        .send-message
          margin-bottom: 1rem
      &.modal-header
        .user-profile-link
          display: inline-block
          .avatar
            display: inline-block
            vertical-align: middle
            margin-right: 0.5rem
`)
