import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'

import { enableMessaging } from 'actions/App'

import Identicon from 'components/Identicon'
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
    const {
      history,
      listingAddress,
      purchaseAddress,
      recipientAddress
    } = this.props
    const newMessage = content.trim()

    if (!content.length) {
      return alert('Please add a message to send')
    }

    try {
      const roomId = await origin.messaging.sendConvMessage(recipientAddress, {
        content: newMessage,
        ...(listingAddress && { listingAddress }),
        ...(purchaseAddress && { purchaseAddress })
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
      <Modal isOpen={open} data-modal="message" handleToggle={handleToggle}>
        <div className="eth-container">
          <Identicon address={recipientAddress} size={80} />
          <h2>
            {'ETH Address:'}
            <br />
            <span className="address">{recipientAddress}</span>
          </h2>
        </div>
        {/* Just a precaution; no one should get here wihout truthy here. */}
        {!canReceiveMessages && (
          <div className="roadblock">
            <FormattedMessage
              id={'MessageNew.cannotReceiveMessages'}
              defaultMessage={'This user has not enabled Origin Messaging.'}
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
              defaultMessage={'You need to enable Origin Messaging.'}
            />
            <div className="button-container">
              <button
                className="btn btn-sm btn-primary"
                onClick={this.props.enableMessaging}
              >
                <FormattedMessage
                  id={'MessageNew.enable'}
                  defaultMessage={'Start Messaging'}
                />
              </button>
            </div>
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
              <button type="submit" className="btn btn-primary">
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
                  'Your message will be encrypted. It will only be visible to you, the recipient, and an arbitrator in the event that a dispute arises.'
                }
              />
            </div>
            <div className="link-container text-center">
              <a href="#" data-modal="profile" onClick={handleToggle}>
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
