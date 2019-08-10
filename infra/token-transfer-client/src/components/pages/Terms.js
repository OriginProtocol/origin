import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { withSendEmailToken } from '@/hoc/withSendEmailToken'

class Terms extends Component {
  state = {
    redirectTo: null
  }

  handleContinue = async () => {
    try {
      await this.props.sendEmailToken(this.state.email)
    } catch (error) {
      this.setState({
        emailError: 'Failed to send email token. Try again shortly.'
      })
      return
    }
    this.setState({ redirectTo: '/check_email' })
  }

  render() {
    if (this.state.emailSent) {
      return <Redirect to={this.state.redirectTo} />
    }

    return (
      <>
        <div className="action-card">
          <h1>Accept Terms</h1>
          <p>Please agree to our terms below and click Continue to proceed</p>
          <div className="form-group">
            <textarea>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris odio lorem, lacinia sed molestie nec, suscipit quis ligula. Morbi vitae ornare felis. Curabitur leo justo, laoreet vel sem ac, vestibulum mollis mauris. Maecenas iaculis elit non elit dictum, ac pharetra nunc interdum. Mauris volutpat scelerisque quam non cursus. Sed eros purus, rhoncus et ex efficitur, dapibus convallis justo. Vestibulum diam eros, condimentum ut ante sit amet, porta mollis quam. Suspendisse sed magna vestibulum, imperdiet tellus a, venenatis metus.

              Nulla non volutpat dolor, vel placerat risus. Maecenas a imperdiet metus. Nulla volutpat lectus ligula, eget malesuada eros fringilla eget. Pellentesque porttitor ultricies mauris non congue.
            </textarea>
          </div>
          <div className="form-group">
            I have read and agree ot the terms and conditions
          </div>
          <button
            className="btn btn-primary btn-lg"
            style={{ marginTop: '40px' }}
            onClick={this.handleContinue}
          >
            Continue
          </button>
        </div>
      </>
    )
  }
}

export default withSendEmailToken(Terms)
