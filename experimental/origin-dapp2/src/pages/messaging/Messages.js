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
            const active = room || get(conversations, '0.id')

            return (
              <div className="row">
                <div className="col-md-3">
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
`)
