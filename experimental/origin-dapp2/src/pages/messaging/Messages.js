import React from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'
import gql from 'graphql-tag'

import withIdentity from 'hoc/withIdentity'
import withWallet from 'hoc/withWallet'
import query from 'queries/Conversations'
import roomQuery from 'queries/Room'

import { OnboardMessaging } from 'pages/onboard/Messaging'
import UpdateMessage from 'mutations/UpdateMessage'

import Room from './Room'
import Avatar from 'components/Avatar'
import QueryError from 'components/QueryError'

import distanceToNow from 'utils/distanceToNow'

const Subject = ({ conversation, ...props }) => {
  const name = get(props, 'identity.profile.fullName', conversation.id)
  const timestamp = conversation.lastMessage
    ? conversation.lastMessage.timestamp
    : conversation.timestamp
  return (
    <>
      <Avatar avatar={get(props, 'identity.profile.avatar')} size={40} />
      <div className="right">
        <div className="top">
          <div className="name">{name}</div>
          <div className="time">{distanceToNow(timestamp)}</div>
        </div>
        {conversation.lastMessage && (
          <div className="last-message">{conversation.lastMessage.content}</div>
        )}
      </div>
    </>
  )
}

const SubjectWithIdentity = withIdentity(Subject)

const Messages = props => (
  <div className="container messages-page">
    <Query query={query} pollInterval={2000}>
      {({ error, data, loading }) => {
        if (error) {
          return <QueryError query={query} error={error} />
        } else if (loading) {
          return <div>Loading conversations...</div>
        } else if (!data || !data.messaging) {
          return <p className="p-3">Cannot query messages</p>
        }

        if (!data.messaging.enabled) {
          return <OnboardMessaging />
        }

        const conversations = get(data, 'messaging.conversations', [])
        const room = get(props, 'match.params.room')
        const active = room || get(conversations, '0.id')

        const displayUnreadCount = ({ messages }) => {
          const unreadCount = messages.reduce((result, msg) => {
            if (msg.status === 'unread' && msg.address !== props.wallet) return [...result, msg]
            return result
          }, []).length

          return unreadCount > 0 && unreadCount
        }
        return (
          <div className="row">
            <div className="col-md-3">
              {conversations.length ? null : <div>No conversations!</div>}
              {conversations.map((conv, idx) => (
                <div
                  className={`room${active === conv.id ? ' active' : ''}`}
                  key={idx}
                  onClick={() => props.history.push(`/messages/${conv.id}`)}
                >
                  <SubjectWithIdentity conversation={conv} wallet={conv.id} />
                  <span
                    className={`align-self-end${displayUnreadCount(conv) ? ' count align-self-end': ''}`}>
                    {displayUnreadCount(conv)}
                  </span>
                </div>
              ))}
            </div>
            <div className="col-md-9">
              {active ? (
                <Mutation mutation={UpdateMessage}>
                  {updateMessage => (
                    <Room id={active} updateMessage={updateMessage}/>
                  )}
                </Mutation>
              ) : null}
            </div>
          </div>
        )
      }}
    </Query>
  </div>
)

export default withWallet(Messages)

require('react-styl')(`
  .messages-page
    margin-top: 1rem
    .room
      padding: 0.75rem
      display: flex
      cursor: pointer
      font-size: 16px
      &.active
        background: var(--dusk)
        color: var(--white)
        .time
          color: var(--white)
      .avatar
        align-self: flex-start
        flex: 0 0 40px
      .count
        border-radius: 44%
        background-color: var(--clear-blue)
        width: 28px
        height: 21px
        color: white
        padding-left: 9px;
        padding-bottom: 23px;
        font-weight: bold;
      .right
        display: flex
        flex: 1
        flex-direction: column
        margin-left: 0.5rem
        min-width: 0
        .top
          display: flex
          flex: 1
          .name
            flex: 1
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis
            font-weight: bold
          .time
            color: var(--bluey-grey)
            font-size: 12px
        .last-message
          line-height: normal
          font-size: 12px
          font-weight: normal
          overflow: hidden
          text-overflow: ellipsis


`)
