import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import mutation from 'mutations/SendMessage'

import Modal from 'components/Modal'

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
      <Modal onClose={() => this.props.onClose()}>
        <Mutation mutation={mutation}>
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
      </Modal>
    )
  }
}

export default SendMessage

require('react-styl')(`
`)
