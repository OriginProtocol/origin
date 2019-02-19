import moment from 'moment-timezone'
import React, { Component, Fragment } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import { enableMessaging } from 'actions/Activation'
import { updateMessage } from 'actions/Message'

import Avatar from 'components/avatar'

import { abbreviateName, formattedAddress, truncateAddress } from 'utils/user'

import origin from '../services/origin'

const imageMaxSize = process.env.IMAGE_MAX_SIZE || (2 * 1024 * 1024) // 2 MiB

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
      web3Account,
      contentOnly,
      previousOfferMessage,
      includeNav
    } = this.props
    const { created, hash, acceptance } = message
    const { address, profile } = user
    const userName = abbreviateName(user, 'Unnamed User')
    const currentUser = web3Account === user.address
    const fullAddress = formattedAddress(address)
    const userAddress = truncateAddress(fullAddress)

    const smallScreen = window.innerWidth <= 991
    const smallScreenOrDevice = smallScreen || mobileDevice
    const chatContent = this.renderContent()
    const correctSide = currentUser ? 'right' : 'left'
    const bubbleAlignment = currentUser ? 'justify-content-end' : 'justify-content-start'
    const bubbleColor = currentUser ? 'user' : ''
    const bubbleTail = contentOnly ? '' : correctSide
    const mobileWidth = smallScreenOrDevice ? 'mobile-width' : ''
    const contentMargin = (!smallScreenOrDevice && contentOnly) ? `content-margin-${correctSide}` : ''
    const previousOffer = previousOfferMessage ? 'previous-offer' : ''

    const UserInfo = () => (
      <Fragment>
        <div className={`name text-truncate align-self-center ${mobileWidth}`}>{userName}</div>
        <span className="address">{userAddress}</span>
      </Fragment>
    )

    return (
      <div className="message-section">
        {showTime && (
          <div className={`timestamp text-center ml-auto ${previousOffer}`}>
            {moment(created).format('MMM Do h:mm a')}
          </div>
        )}
        <div className={`d-flex message ${contentOnly ? '' : correctSide}`}>
          <div className={`content-container d-flex ${bubbleAlignment}`}>
            <div className="align-self-end conversation-avatar">
              {(!smallScreenOrDevice && correctSide === 'left' && !contentOnly) && (
                <Link to={`/users/${fullAddress}`}>
                  <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
                </Link>
              )}
            </div>
            <div className={`chat-bubble tail-${bubbleTail} ${bubbleColor} ${contentMargin}`}>
              <div className="chat-text">
                <div className="sender d-flex flex-row justify-content-start">
                  {(currentUser || !includeNav) ? <UserInfo /> : (
                    <Link to={`/users/${fullAddress}`} className="d-flex flex-row justify-content-start">
                      <UserInfo />
                    </Link>
                  )}
                </div>
                <div className="chat-content">{chatContent}</div>
                {acceptance && <button onClick = { () => {
                  origin.marketplace.resolver.acceptSignedOffer(acceptance.offerId, acceptance.ipfsHash, address, acceptance.signature)  
                    } }> Accept Offer</button>
                }
              </div>
            </div>
            <div className="align-self-end conversation-avatar right">
              {(!smallScreenOrDevice && correctSide === 'right' && !contentOnly) && (
                <Avatar image={profile && profile.avatar} placeholderStyle="blue" />
              )}
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

const mapStateToProps = ({ activation, app, users, wallet }, ownProps) => {
  return {
    messagingEnabled: activation.messaging.enabled,
    mobileDevice: app.mobileDevice,
    user: users.find(u => {
      return formattedAddress(u.address) === formattedAddress(ownProps.message.senderAddress)
    }) || {},
    web3Account: wallet.address
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
