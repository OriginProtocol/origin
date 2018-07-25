import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'
import { withRouter } from 'react-router'

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

    const { history, listingAddress, purchaseAddress, recipientAddress } = this.props

    try {
      const roomId = await origin.messaging.sendConvMessage(recipientAddress, {
        content: this.state.content,
        ...(listingAddress && { listingAddress }),
        ...(purchaseAddress && { purchaseAddress }),
      })

      history.push(`/messages/${roomId}`)
    } catch(err) {
      console.error(err)
    }
  }

  render() {
    const { open, recipientAddress, handleToggle } = this.props
    const { content } = this.state

    return (
      <Modal isOpen={open} data-modal="profile" handleToggle={handleToggle}>
        <h2>
          New Message<br />
          <span className="address" style={{ fontSize: '0.8rem' }}>{recipientAddress}</span>
        </h2>
        <form onSubmit={this.handleSubmit}>
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="form-group">
                  <textarea
                    rows="4"
                    id="content"
                    name="content"
                    className="form-control"
                    value={content}
                    onChange={this.handleChange}
                    placeholder={'Type something...'}
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="explanation text-center">
                  <FormattedMessage
                    id={ 'MessageNew.encryptionNotice' }
                    defaultMessage={ 'Your message will be encrypted. It will only be visible to you, the recipient, and an arbitrator in the event that a dispute arises.' }
                  />
                </div>
                <div className="button-container d-flex justify-content-center">
                  <button type="submit" className="btn btn-clear">
                    <FormattedMessage
                      id={ 'MessageNew.send' }
                      defaultMessage={ 'Send' }
                    />
                  </button>
                </div>
                <div className="link-container text-center">
                  <a
                    href="#"
                    data-modal="profile"
                    onClick={handleToggle}
                  >
                    <FormattedMessage
                      id={ 'MessageNew.cancel' }
                      defaultMessage={ 'Cancel' }
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    )
  }
}

export default withRouter(MessageNew)
