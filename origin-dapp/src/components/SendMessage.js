import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'

import mutation from 'mutations/SendMessage'
import withIdentity from 'hoc/withIdentity'
import query from 'queries/CanConverseWith'

import EnableMessagingModal from 'components/EnableMessagingModal'
import Modal from 'components/Modal'
import QueryError from 'components/QueryError'

class SendMessage extends Component {
  state = { message: '' }
  componentDidMount() {
    if (this.input) {
      this.input.focus()
    }
  }

  componentDidUpdate(prevProps) {
    if (this.input && this.props.to !== prevProps.to) {
      this.input.focus()
    }
  }

  render() {
    const account = this.props.to
    return (
      <>
        <button
          className={this.props.className}
          onClick={e => {
            e.stopPropagation()
            this.setState({ open: true })
          }}
          children={this.props.children}
        />
        {!this.state.open ? null : (
          <Modal
            shouldClose={this.state.shouldClose}
            onClose={() =>
              this.setState({ shouldClose: false, open: false, sent: false })
            }
            className="message-modal"
          >
            <Query query={query} variables={{ account }} skip={!account}>
              {({ error, data, loading }) => {
                if (error) {
                  return <QueryError query={query} error={error} />
                } else if (loading) {
                  return <div>Checking if messaging enabled...</div>
                } else if (!get(data, 'messaging.enabled')) {
                  return <EnableMessagingModal />
                } else if (!data.messaging.canConverseWith) {
                  return this.renderCannotConverse()
                } else if (this.state.sent) {
                  return this.renderSent()
                } else {
                  return this.renderSend()
                }
              }}
            </Query>
          </Modal>
        )}
      </>
    )
  }

  renderCannotConverse() {
    return (
      <>
        <div>
          This user has not yet enabled Origin Messaging. Unfortunately, you
          will not be able to contact them until they do.
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light btn-rounded"
            children="OK"
            onClick={() => this.setState({ shouldClose: true })}
          />
        </div>
      </>
    )
  }

  renderSend() {
    const { to } = this.props
    const recipient = get(this.props, 'identity.fullName')

    return (
      <Mutation
        mutation={mutation}
        onCompleted={({ sendMessage }) =>
          this.setState({ sent: true, room: sendMessage.id })
        }
      >
        {sendMessage => (
          <form
            onSubmit={e => {
              e.preventDefault()
              const content = this.state.message
              if (content) {
                sendMessage({ variables: { to, content } })
                this.setState({ message: '' })
              }
            }}
          >
            <h5 className="mb-3">Send Message</h5>
            <div className="to mb-2">
              {`To: ${recipient ? `${recipient} - ` : ''}${to}`}
            </div>
            <textarea
              className="form-control dark mb-4"
              placeholder="Type something..."
              ref={input => (this.input = input)}
              value={this.state.message}
              onChange={e => this.setState({ message: e.target.value })}
            />
            <button
              className="btn btn-primary btn-rounded"
              type="submit"
              children="Send"
            />
          </form>
        )}
      </Mutation>
    )
  }

  renderSent() {
    return (
      <>
        <h5>Message Sent!</h5>
        <div className="actions">
          <button
            className="btn btn-outline-light btn-rounded"
            children="OK"
            onClick={() => this.setState({ shouldClose: true })}
          />
        </div>
      </>
    )
  }
}

export default withIdentity(SendMessage, 'to')

require('react-styl')(`
  .message-modal
    textarea
      min-height: 6rem
    .to
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
`)
