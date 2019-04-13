import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'

import VerifyTwitterMutation from 'mutations/VerifyTwitter'
import query from 'queries/TwitterAuthUrl'

class TwitterAttestation extends Component {
  state = {
    stage: 'GenerateCode'
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
        <Query
          query={query}
          variables={{
            redirect: encodeURIComponent(
              'http://localhost:3000#/profile/twitter-attestation'
            )
          }}
        >
          {({ data }) => {
            const authUrl = get(data, 'identityEvents.twitterAuthUrl')
            return <div>{this[`render${this.state.stage}`]({ authUrl })}</div>
          }}
        </Query>
      </Modal>
    )
  }

  renderGenerateCode({ authUrl }) {
    return (
      <>
        <h2>
          <fbt desc="TwitterAttestation.verify">
            Verify your Twitter Account
          </fbt>
        </h2>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="help">
          <fbt desc="TwitterAttestation.description">
            Other users will know that you have a verified Twitter account, but
            your account details will not be published on the blockchain. We
            will never post on your behalf.
          </fbt>
        </div>
        <div className="actions">
          <a href={authUrl} className="btn btn-outline-light">
            {fbt('Continue', 'Continue')}
          </a>
          {/* }{this.renderVerifyButton()} */}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('Cancel', 'Cancel')}
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
            className="btn btn-outline-light"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              verifyCode({
                variables: {
                  identity: this.props.wallet
                }
              })
            }}
            children={
              this.state.loading
                ? fbt('Loading...', 'Loading...')
                : fbt('Continue', 'Continue')
            }
          />
        )}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>
          <fbt desc="TwitterAttestation.verified">
            Twitter account verified!
          </fbt>
        </h2>
        <div className="instructions">
          <fbt desc="Attestation.DontForget">
            Don&apos;t forget to publish your changes.
          </fbt>
        </div>
        <div className="help">
          <fbt desc="Attestation.publishingBlockchain">
            Publishing to the blockchain lets other users know that you have a
            verified profile.
          </fbt>
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.props.onComplete(this.state.data)
              this.setState({ shouldClose: true })
            }}
            children={fbt('Continue', 'Continue')}
          />
        </div>
      </>
    )
  }
}

export default TwitterAttestation

require('react-styl')(`
`)
