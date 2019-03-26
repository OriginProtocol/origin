import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import Modal from 'components/Modal'

import VerifyTwitterMutation from 'mutations/VerifyTwitter'

class TwitterAttestation extends Component {
  state = {
    stage: 'GenerateCode',
    email: '',
    code: ''
  }

  componentDidUpdate(prevProps, prevState) {
    const didOpen = !prevProps.open && this.props.open,
      didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && (didOpen || didChangeStage)) {
      this.inputRef.focus()
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    return (
      <Modal
        className={`attestation-modal twitter${
          this.state.stage === 'VerifiedOK' ? ' success' : ''
        }`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode',
            loading: false
          })
          this.props.onClose()
        }}
      >
        <div>{this[`render${this.state.stage}`]()}</div>
      </Modal>
    )
  }

  renderGenerateCode() {
    return (
      <>
        <h2>Verify your Twitter Account</h2>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="alert alert-danger mt-3 d-block d-sm-none">
          <b>Warning:</b> Currently unavailable on mobile devices
        </div>
        <div className="help">
          Other users will know that you have a verified Twitter account, but
          your account details will not be published on the blockchain. We will
          never post on your behalf.
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt("Cancel", "Cancel")}
          />
        </div>
      </>
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyTwitterMutation}
        onCompleted={res => {
          const result = res.verifyTwitter
          if (result.success) {
            this.setState({
              stage: 'VerifiedOK',
              data: result.data,
              loading: false
            })
          } else {
            this.setState({ error: result.reason, loading: false })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {verifyCode => (
          <button
            className="btn btn-outline-light d-none d-sm-block"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  email: this.state.email,
                  code: this.state.code
                }
              })
            }}
            children={this.state.loading ? 'Loading...' : 'Continue'}
          />
        )}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>Twitter account verified!</h2>
        <div className="instructions">
          Don&apos;t forget to publish your changes.
        </div>
        <div className="help">
          Publishing to the blockchain lets other users know that you have a
          verified profile.
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.props.onComplete(this.state.data)
              this.setState({ shouldClose: true })
            }}
            children={fbt("Continue", "Continue")}
          />
        </div>
      </>
    )
  }
}

export default TwitterAttestation

require('react-styl')(`
`)
