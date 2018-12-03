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
      contentOnly,
      mobileDevice,
      seller,
      web3Account
    } = this.props
    const { created, hash } = message
    const { address, fullName, profile } = user
    const currentUser = web3Account === user.address
    const chatColor = currentUser ? '#1a82ff' : '#ebf0f3'
    const textColor = currentUser ? 'white' : 'black'

    const ChatBubble = (props) => {
      const { id, text, textColor, color, fullName, address } = props
      const myText = document.getElementById(id)
      const height = (myText && myText.clientHeight) || 50
      const width = myText && myText.clientWidth

      return (
        <div className="bubble">
          <svg viewBox={`0 0 220 ${height}`} xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="0" width="125" height={height} rx="10" ry="10" style={{ fill: color }} />
            <polygon points="15,50 30,30 30,45" style={{ fill: color }} />
          </svg>
          <div id={id} className="chat-text">
            <div className="sender">
              {fullName && <div className="name text-truncate">{fullName}</div>}
              <span className="address text-muted">{truncateWithCenterEllipsis(address)}</span>
            </div>
            <span style={{ color: textColor }}>{text}</span>
          </div>
        </div>
      )
    }

    if (mobileDevice) {
      return (
        <div className="message-section">
          <div className="timestamp text-center ml-auto">
            {moment(created).format('MMM Do h:mm a')}
          </div>
          <div className="d-flex message">
            <div className="content-container">
              <ChatBubble
                text={this.renderContent()}
                id={hash}
                color={chatColor}
                textColor={textColor}
                fullName={fullName}
                address={address}
              />
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
          <div className="message-content">{this.renderContent()}</div>
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
