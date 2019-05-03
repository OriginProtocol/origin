import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import Modal from 'components/Modal'
import AutoMutate from 'components/AutoMutate'

import VerifyFacebookMutation from 'mutations/VerifyFacebook'
import query from 'queries/FacebookAuthUrl'

class FacebookAttestation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'GenerateCode',
      mobile: window.innerWidth < 767
    }
    this.onResize = this.onResize.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  componentDidUpdate(prevProps, prevState) {
    const didOpen = !prevProps.open && this.props.open,
      didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && (didOpen || didChangeStage)) {
      this.inputRef.focus()
    }
  }

  onResize() {
    if (window.innerWidth < 767 && !this.state.mobile) {
      this.setState({ mobile: true })
    } else if (window.innerWidth >= 767 && this.state.mobile) {
      this.setState({ mobile: false })
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const isMobile = this.state.mobile

    const { origin, pathname } = window.location
    const redirect = isMobile
      ? encodeURIComponent(`${origin}${pathname}#/profile/facebook`)
      : null

    return (
      <Modal
        className={`attestation-modal facebook${
          this.state.stage === 'VerifiedOK' ? ' success' : ''
        }`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode'
          })
          this.props.history.replace('/profile')
          this.props.onClose()
        }}
      >
        <Query query={query} variables={{ redirect }}>
          {({ data }) => {
            const authUrl = get(data, 'identityEvents.facebookAuthUrl')
            return (
              <div>
                {this[`render${this.state.stage}`]({
                  authUrl,
                  redirect: isMobile
                })}
              </div>
            )
          }}
        </Query>
      </Modal>
    )
  }

  renderGenerateCode({ authUrl, redirect }) {
    return (
      <>
        <h2>
          <fbt desc="FacebookAttestation.verfify">
            Verify your Facebook Account
          </fbt>
        </h2>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="help">
          <fbt desc="FacebookAttestation.verfify.explanation">
            Other users will know that you have a verified Facebook account, but
            your account details will not be published on the blockchain. We
            will never post on your behalf.
          </fbt>
        </div>
        <div className="actions">
          {this.renderVerifyButton({ authUrl, redirect })}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children={fbt('Cancel', 'Cancel')}
          />
        </div>
      </>
    )
  }

  renderVerifyButton({ authUrl, redirect }) {
    const matchSid = window.location.href.match(/sid=([a-zA-Z0-9_-]+)/i)
    const sid = matchSid && matchSid[1] ? matchSid[1] : null
    return (
      <Mutation
        mutation={VerifyFacebookMutation}
        onCompleted={res => {
          const result = res.verifyFacebook
          if (result.success) {
            this.setState({
              stage: 'VerifiedOK',
              data: result.data,
              loading: false
            })
            this.props.history.replace('/profile')
          } else {
            this.setState({ error: result.reason, loading: false })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {verifyCode => {
          const runMutation = () => {
            if (this.state.loading) return
            this.setState({ error: false, loading: true })
            verifyCode({
              variables: {
                identity: this.props.wallet,
                authUrl,
                redirect,
                code: sid
              }
            })
          }
          return (
            <>
              {sid && this.props.wallet ? (
                <AutoMutate mutatation={runMutation} />
              ) : null}
              <button
                className="btn btn-outline-light"
                onClick={runMutation}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
            </>
          )
        }}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>
          <fbt desc="FacebookAttestation.verified">
            Facebook account verified!
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

export default withRouter(FacebookAttestation)

require('react-styl')(`
`)
