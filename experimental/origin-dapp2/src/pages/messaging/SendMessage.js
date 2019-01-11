import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import mutation from 'mutations/SendMessage'

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
    const { to } = this.props
    return (
      <Mutation mutation={mutation}>
        {sendMessage => (
          <form
            className="send-message d-flex"
            onSubmit={e => {
              e.preventDefault()
              const content = this.state.message
              if (content) {
                sendMessage({ variables: { to, content } })
                this.setState({ message: '' })
              }
            }}
          >
            <input
              type="text"
              className="form-control"
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
}

export default SendMessage

require('react-styl')(`
  .send-message
    border-top: 1px solid var(--pale-grey)
    padding-top: 1rem
    margin-top: 1rem
    .form-control
      margin-right: 1rem
`)
