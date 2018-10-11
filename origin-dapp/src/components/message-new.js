import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { enableMessaging } from 'actions/App'

import Identicon from 'components/identicon'
import Modal from 'components/modal'

import origin from '../services/origin'

class MessageNew extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.state = { content: '' }
  }

  handleChange(e) {
    e.preventDefault

    this.setState({ content: e.target.value })
  }

  async handleSubmit(e) {
    e.preventDefault()

    const { content } = this.state
    const { history, listingId, purchaseId, recipientAddress } = this.props
    const newMessage = content.trim()

    if (!content.length) {
      return alert('Please add a message to send')
    }

    try {
      const roomId = await origin.messaging.sendConvMessage(recipientAddress, {
        content: newMessage,
        ...(listingId && { listingId }),
        ...(purchaseId && { purchaseId })
      })

      history.push(`/messages/${roomId}`)
    } catch (err) {
      console.error(err)
    }
  }

  render() {
    const {
      messagingEnabled,
      open,
      recipientAddress,
      handleToggle
    } = this.props
    const { content } = this.state
    const canReceiveMessages = origin.messaging.canReceiveMessages(
      recipientAddress
    )
    const canDeliverMessage = origin.messaging.canConverseWith(recipientAddress)

    return (
      <Modal
        isOpen={open}
        data-modal="message"
        handleToggle={handleToggle}
        tabIndex="-1"
      >
        <div className="eth-container">
          <Identicon address={recipientAddress} size={80} />
          <h2>
            {'ETH Address:'}
            <br />
            <span className="address">{recipientAddress}</span>
          </h2>
        </div>
        {/* Recipient needs to enable messaging. */}
        {!canReceiveMessages && (
          <div className="roadblock">
            <FormattedMessage
              id={'MessageNew.cannotReceiveMessages'}
              defaultMessage={'This user has not yet enabled Origin Messaging. Unfortunately, you will not be able to contact them until they do.'}
            />
            <div className="link-container text-center">
              <a href="#" data-modal="profile" onClick={handleToggle}>
                <FormattedMessage
                  id={'MessageNew.cancel'}
                  defaultMessage={'Cancel'}
                />
              </a>
            </div>
          </div>
        )}
        {/* Current user needs to enable messaging. */}
        {canReceiveMessages &&
          !messagingEnabled && (
          <div className="roadblock">
            <FormattedMessage
              id={'MessageNew.cannotSendMessages'}
              defaultMessage={'Before you can contact this user, you need to enable messaging.'}
            />
            <div className="button-container">
              <button
                className="btn btn-sm btn-primary"
                onClick={this.props.enableMessaging}
                ga-category="messaging"
                ga-label="message_new_component_enable"
              >
                <FormattedMessage
                  id={'MessageNew.enable'}
                  defaultMessage={'Start Messaging'}
                />
              </button>
            </div>
            <div className="link-container text-center">
              <a
                href="#"
                data-modal="profile"
                onClick={handleToggle}
                ga-category="messaging"
                ga-label="message_new_component_cancel"
              >
                <FormattedMessage
                  id={'MessageNew.cancel'}
                  defaultMessage={'Cancel'}
                />
              </a>
            </div>
          </div>
        )}
        {/* Both users have enabled messaging. */}
        {canDeliverMessage && (
          <form className="new-message" onSubmit={this.handleSubmit}>
            <div className="form-group">
              <textarea
                rows="4"
                id="content"
                name="content"
                className="form-control text-left"
                value={content}
                onChange={this.handleChange}
                placeholder={'Message this user...'}
              />
            </div>
            <div className="button-container d-flex justify-content-center">
              <button
                type="submit"
                className="btn btn-primary"
                ga-category="messaging"
                ga-label="send_message"
              >
                <FormattedMessage
                  id={'MessageNew.send'}
                  defaultMessage={'Send'}
                />
              </button>
            </div>
            <div className="explanation text-center">
              <FormattedMessage
                id={'MessageNew.encryptionNotice'}
                defaultMessage={
                  'Your message will be private to you and the recipient. An arbitrator will see your messages if either of you opens a dispute.'
                }
              />
            </div>
            <div className="link-container text-center">
              <a
                href="#"
                data-modal="profile"
                onClick={handleToggle}
                ga-category="messaging"
                ga-label="cancel_message"
              >
                <FormattedMessage
                  id={'MessageNew.cancel'}
                  defaultMessage={'Cancel'}
                />
              </a>
            </div>
          </form>
        )}
      </Modal>
    )
  }
}

const mapStateToProps = state => {
  return {
    messagingEnabled: state.app.messagingEnabled
  }
}

const mapDispatchToProps = dispatch => ({
  enableMessaging: () => dispatch(enableMessaging())
})

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(MessageNew)
)
