import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'

import query from 'queries/Room'
import SendMessage from './SendMessage'
import Avatar from 'components/Avatar'

class Message extends Component {
  render() {
    const { message, them } = this.props
    const name = get(this.props, 'identity.profile.fullName', '')
    return (
      <div className={`message${them ? ' them' : ''}`}>
        <Avatar avatar={get(this.props, 'identity.profile.avatar')} size={60} />
        <div className="bubble">
          <div className="top">
            <div className="name">{name}</div>
            <div className="account">{get(message, 'address')}</div>
          </div>
          <div className="content">{get(message, 'msg.content')}</div>
        </div>
      </div>
    )
  }
}

const MessageWithIdentity = withIdentity(Message)

class AllMessages extends Component {
  componentDidMount() {
    if (this.el) {
      this.el.scrollTop = this.el.scrollHeight
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.messages.length > prevProps.messages.length) {
      this.el.scrollTop = this.el.scrollHeight
    }
  }
  render() {
    return (
      <div className="messages" ref={el => this.el = el}>
        {this.props.messages.map((message, idx) => (
          <MessageWithIdentity
            message={message}
            key={idx}
            wallet={get(message, 'address')}
            them={this.props.wallet !== get(message, 'address')}
          />
        ))}
      </div>
    )
  }
}

class Room extends Component {
  render() {
    const { id, wallet } = this.props
    return (
      <div className="container">
        <Query query={query} pollInterval={2000} variables={{ id }}>
          {({ error, data, networkStatus }) => {
            if (networkStatus === 1) {
              return <div>Loading...</div>
            } else if (error) {
              return <div>Error :(</div>
            } else if (!data || !data.messaging) {
              return <p className="p-3">Cannot query messages</p>
            }

            const messages = get(data, 'messaging.conversation.messages', [])

            return (
              <>
                <AllMessages messages={messages} wallet={wallet} />
                <SendMessage to={this.props.id} />
              </>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default withWallet(Room)

require('react-styl')(`
  .messages-page .messages
    max-height: calc(100vh - 160px)
    overflow: auto
    display: flex
    flex-direction: column
    align-items: start
    .message
      display: flex
      align-items: flex-end;
      margin-bottom: 1rem
      .bubble
        margin-left: 1.5rem
        padding: 1rem
        background-color: var(--pale-grey)
        border-radius: 1rem
        position: relative
        .top
          font-size: 14px
          display: flex
          .name
            font-weight: normal
            margin-right: 0.5rem
          .account
            max-width: 6rem
            overflow: hidden
            text-overflow: ellipsis
        .content
          font-weight: normal
          font-size: 16px
        &::after
          content: '';
          bottom: 8px;
          left: -34px;
          position: absolute;
          border: 0px solid;
          display: block;
          width: 38px;
          height: 26px;
          background-color: transparent;
          border-bottom-left-radius: 50%;
          border-bottom-right-radius: 50%;
          box-shadow: 10px 11px 0px -3px var(--pale-grey);
          transform: rotate(-42deg);

      &.them
        align-self: flex-end
        flex-direction: row-reverse
        .bubble
          background-color: var(--clear-blue)
          color: var(--white)
          margin-right: 1.5rem
          margin-left: 0
          &::after
            right: -34px;
            left: auto
            box-shadow: -10px 11px 0px -3px var(--clear-blue);
            transform: rotate(42deg);

`)
