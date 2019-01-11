import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import withIdentity from 'hoc/withIdentity'
import query from 'queries/Conversations'

import Room from './Room'
import Avatar from 'components/Avatar'

function distanceToNow(timestamp) {
  const now = new Date().getTime()
  const diff = Math.round((now - timestamp) / 1000)
  if (diff < 60) {
    return '<1m'
  } else if (diff < 3600) {
    return `${Math.round(diff / 60)}m`
  } else if (diff < 86400) {
    return `${Math.round(diff / 3600)}h`
  }
}

class Subject extends Component {
  render() {
    const { conversation } = this.props
    const name = get(this.props, 'identity.profile.fullName', conversation.id)
    return (
      <>
        <Avatar avatar={get(this.props, 'identity.profile.avatar')} size={40} />
        <div className="name">{name}</div>
        <div className="time">
          {distanceToNow(this.props.conversation.timestamp)}
        </div>
      </>
    )
  }
}

const SubjectWithIdentity = withIdentity(Subject)

class Messages extends Component {
  state = { room: null }
  render() {
    return (
      <div className="container messages-page">
        <Query query={query} pollInterval={2000}>
          {({ error, data, networkStatus }) => {
            if (networkStatus === 1) {
              return <div>Loading...</div>
            } else if (error) {
              return <div>Error :(</div>
            } else if (!data || !data.messaging) {
              return <p className="p-3">Cannot query messages</p>
            }

            const conversations = get(data, 'messaging.conversations', [])
            const active = this.state.room || get(conversations, '0.id')

            return (
              <div className="row">
                <div className="col-md-3">
                  {conversations.map((conv, idx) => (
                    <div
                      className={`room${active === conv.id ? ' active' : ''}`}
                      key={idx}
                      onClick={() => this.setState({ room: conv.id })}
                    >
                      <SubjectWithIdentity
                        conversation={conv}
                        wallet={conv.id}
                      />
                    </div>
                  ))}
                </div>
                <div className="col-md-9">
                  {active ? <Room id={active} /> : null}
                </div>
              </div>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default Messages

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
      .name
        flex: 1
        overflow: hidden
        text-overflow: ellipsis
        margin-left: 0.5rem
        font-weight: bold
      .time
        color: var(--bluey-grey)
        font-size: 12px

`)
