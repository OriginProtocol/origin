import React from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'

import withIdentity from 'hoc/withIdentity'
import withWallet from 'hoc/withWallet'
import query from 'queries/Conversations'

import { OnboardMessaging } from 'pages/onboard/Messaging'
import UpdateMessages from 'mutations/UpdateMessages'

import Room from './Room'
import Avatar from 'components/Avatar'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'

import distanceToNow from 'utils/distanceToNow'

const Subject = ({ conversation, ...props }) => {
  const name = get(props, 'identity.fullName', conversation.id)
  const timestamp = conversation.lastMessage
    ? conversation.lastMessage.timestamp
    : conversation.timestamp
  return (
    <>
      <Avatar avatar={get(props, 'identity.avatar')} size={40} />
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
    <PageTitle>Messaging</PageTitle>
    <Query
      query={query}
      pollInterval={2000}
      variables={{ wallet: props.wallet }}
    >
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
                    className={`align-self-end${
                      conv.totalUnread > 0 ? ' count align-self-end' : ''
                    }`}
                  >
                    {conv.totalUnread > 0 && conv.totalUnread}
                  </span>
                </div>
              ))}
            </div>
            <div className="col-md-9">
              {active ? (
                <Mutation mutation={UpdateMessages}>
                  {updateMessages => (
                    <Room id={active} updateMessages={updateMessages} />
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
        padding-left: 9px
        padding-bottom: 23px
        font-weight: bold
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
