import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

import GenerateAirbnbCodeMutation from 'mutations/GenerateAirbnbCode'
import VerifyAirbnbCodeMutation from 'mutations/VerifyAirbnbCode'

class AirbnbAttestation extends Component {
  state = {
    stage: 'GenerateCode',
    airbnbUserId: '',
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
        className={`attestation-modal airbnb${
          this.state.stage === 'VerifiedOK' ? ' success' : ''
        }`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode'
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
        <h2>
          <fbt desc="VerifyAirbnb.averifyAirbnbAccount">
            Verify your Airbnb account
          </fbt>
        </h2>
        <div className="instructions">
          <fbt desc="VerifyAirbnb.enterAirbnbProfileUrl">
            Enter Airbnb profile URL below
          </fbt>
        </div>
        <div className="mt-3">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg"
            placeholder="https://www.airbnb.com/users/show/123"
            value={this.state.airbnbUserId}
            onChange={e => this.setState({ airbnbUserId: e.target.value })}
          />
        </div>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="help">
          <fbt desc="VerifyAirbnb.airbnbProfilePublished">
            Other users will know that you have a verified Airbnb profile and
            your user id will be published on the blockchain.
          </fbt>
        </div>
        <div className="actions">
          {this.renderCodeButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('Cancel', 'VerifyAirbnb.cancel')}
          />
        </div>
      </>
    )
  }

  renderVerifyCode() {
    return (
      <>
        <h2>
          <fbt desc="VerifyAirbnb.averifyAirbnbAccount">
            Verify your Airbnb account
          </fbt>
        </h2>
        <div className="instructions">
          <fbt desc="VerifyAirbnb.enterCodeIntoAirbnb">
            Go to the Airbnb website, edit your profile and paste the following
            text into profile description:
          </fbt>
        </div>
        <div className="my-3 verification-code">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg"
            value={this.state.code}
            readOnly
          />
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="help">
          <fbt desc="VerifyAirbnb.continueToConfirmationCodeCheck">
            Continue once the confirmation code is entered in your Airbnb
            profile.
          </fbt>
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('Cancel', 'VerifyAirbnb.cancel')}
          />
        </div>
      </>
    )
  }

  renderCodeButton() {
    return (
      <Mutation
        mutation={GenerateAirbnbCodeMutation}
        onCompleted={res => {
          const result = res.generateAirbnbCode
          if (result.success) {
            this.setState({
              stage: 'VerifyCode',
              code: result.code,
              loading: false
            })
          } else {
            this.setState({ error: result.reason, loading: false })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {generateCode => (
          <button
            className="btn btn-outline-light"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              generateCode({
                variables: {
                  identity: this.props.wallet,
                  airbnbUserId: this.state.airbnbUserId
                }
              })
            }}
            children={this.state.loading ? 'Loading...' : 'Continue'}
          />
        )}
      </Mutation>
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyAirbnbCodeMutation}
        onCompleted={res => {
          const result = res.verifyAirbnbCode
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
            className="btn btn-outline-light"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  airbnbUserId: this.state.airbnbUserId
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
        <h2>Airbnb account verified!</h2>
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

export default AirbnbAttestation

require('react-styl')(`
`)
