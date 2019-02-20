import React from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import query from 'queries/Conversations'
import MarkConversationRead from 'mutations/MarkConversationRead'

import { OnboardMessaging } from 'pages/onboard/Messaging'

import RoomStatus from './RoomStatus'
import Room from './Room'
import QueryError from 'components/QueryError'
import PageTitle from 'components/PageTitle'

const Messages = props => (
  <div className="container messages-page">
    <PageTitle>Messaging</PageTitle>
    <Mutation mutation={MarkConversationRead}>
      {markConversationRead => (
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
            const active = room
            const displayConversations = !!room ? 'd-none' : 'd-block'
            const displayBackNav = !!room ? 'd-block' : 'd-none'

            return (
              <div className="row">
                <div className={`back ${displayBackNav} d-md-none flex-row justify-content-start`}>
                  <div className="align-self-start">
                    <i className="icon-arrow-left align-self-start mr-auto" onClick={() => props.history.push(`/messages`)}></i>
                  </div>
                </div>
                <div className={`col-md-3 ${displayConversations} d-md-block`}>
                  {conversations.length ? null : <div>No conversations!</div>}
                  {conversations.map((conv, idx) => (
                    <RoomStatus
                      key={idx}
                      active={active === conv.id}
                      conversation={conv}
                      wallet={conv.id}
                      onClick={() => props.history.push(`/messages/${conv.id}`)}
                    />
                  ))}
                </div>
                <div className="col-md-9">
                  {active ? (
                    <Room id={active} markRead={markConversationRead} />
                  ) : null}
                </div>
              </div>
            )
          }}
        </Query>
      )}
    </Mutation>
  </div>
)

export default withWallet(Messages)

require('react-styl')(`
  .messages-page
    margin-top: 1rem
    .back
      background-color: var(--dusk)
      height: 60px
      width: 100%
      margin-bottom: 10px
      margin-top: -16px

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
`)
