import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'

import mutation from 'mutations/SendMessage'
import withIdentity from 'hoc/withIdentity'
import query from 'queries/Conversations'

import { OnboardMessaging } from 'pages/onboard/Messaging'
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
    return (
      <Query query={query} pollInterval={2000}>
        {({ error, data, loading }) => {
          if (error) {
            return <QueryError query={query} error={error} />
          } else if (loading) {
            return <div>Checking if messaging enabled...</div>
          } else if (!data || !data.messaging) {
            return <p className="p-3">Cannot query messaging</p>
          }

          if (!data.messaging.enabled) {
            return <OnboardMessaging />
          }

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
                    this.setState({ shouldClose: false, open: false })
                  }
                  className="message-modal"
                >
                  {this.state.sent ? this.renderSent() : this.renderSend()}
                </Modal>
              )}
            </>
          )
        }}
      </Query>
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
    .to
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
`)
