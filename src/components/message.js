import moment from 'moment'
import React, { Component } from 'react'

import { fetchUser } from 'actions/User'

import Avatar from './avatar'

class Message extends Component {
  render() {
    const { content, created, senderAddress, senderName } = this.props.message

    return (
      <div className="d-flex message">
        <Avatar placeholderStyle="blue" />
        <div className="content-container">
          <div className="meta-container d-flex text-truncate">
            <div className="sender text-truncate">
              {senderName || senderAddress}
            </div>
            <div className="timestamp text-right ml-auto">
              {moment(created).format('MMM Do h:mm a')}
            </div>
          </div>
          <div className="message">
            {content}
          </div>
        </div>
      </div>
    )
  }
}

export default Message
