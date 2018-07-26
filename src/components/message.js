import moment from 'moment'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

class Message extends Component {
  componentDidMount() {
    const { message } = this.props

    if (message.status === 'unread') {
      this.props.updateMessage({ ...message, status: 'read' })
    }
  }

  render() {
    const { message, user } = this.props
    const { content, created } = message
    const { address, fullName, profile } = user

    return (
      <div className="d-flex message">
        <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
        <div className="content-container">
          <div className="meta-container d-flex">
            <div className="sender text-truncate">
              {fullName && <span className="name">{fullName}</span>}
              <span className="address text-muted">{address}</span>
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
