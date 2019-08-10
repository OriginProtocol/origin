import React, { Component } from 'react'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

function withSendEmailToken(WrappedComponent) {
  class WithSendEmailToken extends Component {
    constructor(props) {
      super(props)
    }

    async sendEmailToken(email) {
      await agent.post(`${apiUrl}/api/send_email_token`).send({ email })
    }

    render() {
      return (
        <WrappedComponent
          {...this.props}
          sendEmailToken={this.sendEmailToken}
        />
      )
    }
  }

  return WithSendEmailToken
}

export default withSendEmailToken
