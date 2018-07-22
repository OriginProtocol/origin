import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

class Message extends Component {
  render() {
    const { message, user } = this.props
    const { content, created, status } = message
    const { address, fullName } = user

    if (status === 'unread') {
      this.props.updateMessage({ ...message, status: 'read' })
    }

    return (
      <div className="d-flex message">
        <Avatar placeholderStyle="blue" />
        <div className="content-container">
          <div className="meta-container d-flex text-truncate">
            <div className="sender text-truncate">
              {fullName || address}
            </div>
            <div className="timestamp text-right ml-auto">
              {moment(created).format('MMM Do h:mm a')}
            </div>
          </div>
          <div className="message-content">
            {content}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    user: state.users.find(u => u.address === ownProps.message.senderAddress) || {},
  }
}

const mapDispatchToProps = dispatch => ({
  updateMessage: (obj) => dispatch(updateMessage(obj)),
})

export default connect(mapStateToProps, mapDispatchToProps)(Message)
