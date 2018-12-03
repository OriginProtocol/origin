import moment from 'moment'
import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { enableMessaging } from 'actions/App'
import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || (2 * 1024 * 1024) // 2 MiB
const MAX_ADDRESS_LENGTH = 9

function truncateWithCenterEllipsis(fullStr = '', strLen) {
  if (fullStr.length <= MAX_ADDRESS_LENGTH) return fullStr;
  const separator = '...'
  const frontChars = 5
  const backChars = 4

  return fullStr.substr(0, frontChars)
    + separator
    + fullStr.substr(fullStr.length - backChars)
}

class Message extends Component {
  componentDidMount() {
    const { message } = this.props

    if (message.status === 'unread') {
      this.props.updateMessage({ ...message, status: 'read' })
    }
  }

  render() {
    const {
      enableMessaging,
      message,
      messagingEnabled,
      user,
      showTime,
      mobileDevice,
      seller,
      web3Account
    } = this.props
    const { created, hash } = message
    const { address, fullName, profile } = user
    const currentUser = web3Account === user.address
    const chatContent = this.renderContent()
    const chatTail = currentUser ? 'tail-right' : 'tail-left'
    const bubbleAlignment = currentUser ? 'justify-content-end' : 'justify-content-start'
    const bubbleColor = currentUser && 'user'

    return (
      <div className="message-section">
        {showTime && (
          <div className="timestamp text-center ml-auto">
            {moment(created).format('MMM Do h:mm a')}
          </div>
        )}
        <div className="d-flex message">
          <div className={`content-container d-flex ${bubbleAlignment}`}>
          <div className={`chat-bubble ${chatTail} ${bubbleColor}`}>
            <div className="chat-text">
              <div className="sender">
                {fullName && <div className="name text-truncate">{fullName}</div>}
                <span className="address">{truncateWithCenterEllipsis(address)}</span>
                <p className="chat-content">{chatContent}</p>
              </div>
            </div>
          </div>
            {!messagingEnabled &&
              hash === 'origin-welcome-message' && (
              <div className="button-container">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={enableMessaging}
                  ga-category="messaging"
                  ga-label="message_component_enable"
                >
                  <FormattedMessage
                    id={'message.enable'}
                    defaultMessage={'Enable Messaging'}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  renderContent() {
    const { content } = this.props.message
    const contentWithLineBreak = `${content}\n`
    const contentIsData = content.match(/^data:/)
    const dataIsImage = contentIsData && content.match(/^data:image/)
    const imageTooLarge = content.length > imageMaxSize

    if (!contentIsData) {
      return contentWithLineBreak
    } else if (!dataIsImage) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.unrecognizedData'}
            defaultMessage={'Message data cannot be rendered.'}
          />
        </div>
      )
    } else if (imageTooLarge) {
      return (
        <div className="system-message">
          <FormattedMessage
            id={'message.imageTooLarge'}
            defaultMessage={'Message image is too large to display.'}
          />
        </div>
      )
    } else {
      const fileName = content.match(/name=.+;/).slice(5, -1)
      return (
        <div className="image-container">
          <img src={content} alt={fileName} />
        </div>
      )
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    messagingEnabled: state.app.messagingEnabled,
    mobileDevice: state.app.mobileDevice,
    user:
      state.users.find(u => u.address === ownProps.message.senderAddress) || {},
    web3Account: state.wallet.address
  }
}

const mapDispatchToProps = dispatch => ({
  enableMessaging: () => dispatch(enableMessaging()),
  updateMessage: obj => dispatch(updateMessage(obj))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Message)
