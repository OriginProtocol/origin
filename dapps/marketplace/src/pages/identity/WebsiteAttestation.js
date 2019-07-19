import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import PublishedInfoBox from 'components/_PublishedInfoBox'

import GenerateWebsiteCodeMutation from 'mutations/GenerateWebsiteCode'
import VerifyWebsiteMutation from 'mutations/VerifyWebsite'

class WebsiteAttestation extends Component {
  state = {
    stage: 'GenerateCode',
    website: '',
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

    const ModalComponent = this.props.isMobile ? MobileModal : Modal

    return (
      <ModalComponent
        title={fbt('Verify your website', 'VerifyWebsite.verifyYourWebsite')}
        className={`attestation-modal website${
          this.state.stage === 'VerifiedOK' ? ' success' : ''
        }`}
        shouldClose={this.state.shouldClose}
        onClose={() => {
          const completed = this.state.completed

          if (completed) {
            this.props.onComplete(this.state.data)
          }

          this.setState({
            shouldClose: false,
            error: false,
            stage: 'GenerateCode',
            completed: false,
            data: null
          })

          this.props.onClose(completed)
        }}
        lightMode={true}
        skipAnimateOnExit={this.props.skipAnimateOnExit}
      >
        <div>{this[`render${this.state.stage}`]()}</div>
      </ModalComponent>
    )
  }

  renderGenerateCode() {
    const { isMobile } = this.props

    const header = isMobile ? null : (
      <fbt desc="VerifyWebsite.verifyYourWebsite">Verify your website</fbt>
    )

    return (
      <>
        <h2>{header}</h2>
        <div className="instructions">
          <fbt desc="VerifyWebsite.enterWebsiteUrl">
            Enter your website URL below
          </fbt>
        </div>
        <div className="mt-3">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg"
            placeholder="https://www.mywebsite.com"
            value={this.state.website}
            onChange={e => this.setState({ website: e.target.value })}
          />
        </div>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}

        <PublishedInfoBox
          title={fbt(
            'What will be visible on the blockchain?',
            'VerifyWebsite.visibleOnChain'
          )}
          children={
            <fbt desc="VerifyWebsite.websitePublished">
              Your website&apos;s URL
            </fbt>
          }
          pii={true}
        />
        <div className="actions">
          {this.renderCodeButton()}
          {isMobile ? null : (
            <button
              className="btn btn-link"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'VerifyWebsite.cancel')}
            />
          )}
        </div>
      </>
    )
  }

  renderDownloadCode() {
    const { isMobile } = this.props

    return (
      <>
        <h2>
          <fbt desc="VerifyWebsite.uploadFile">
            Upload the file to your website
          </fbt>
        </h2>
        <div className="instructions">
          <fbt desc="VerifyWebsite.uploadCodeToWebsite">
            Download the following file and place it in the root of your
            website:
          </fbt>
        </div>
        <div className="actions">
          {this.renderDownloadButton()}
          {isMobile ? null : (
            <button
              className="btn btn-link"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'VerifyWebsite.cancel')}
            />
          )}
        </div>
      </>
    )
  }

  renderVerifyCode() {
    const { isMobile } = this.props

    const header = isMobile ? null : (
      <fbt desc="VerifyWebsite.verifyYourWebsite">Verify your website</fbt>
    )

    return (
      <>
        <h2>{header}</h2>
        <div className="instructions">
          <fbt desc="VerifyWebsite.continueAfterUPload">
            Continue once you have uploaded the file and it is accessible.
          </fbt>
        </div>
        <div className="error-alert">
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          {isMobile ? null : (
            <button
              className="btn btn-link"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'VerifyWebsite.cancel')}
            />
          )}
        </div>
      </>
    )
  }

  renderCodeButton() {
    return (
      <Mutation
        mutation={GenerateWebsiteCodeMutation}
        onCompleted={res => {
          const result = res.generateWebsiteCode
          if (result.success) {
            this.setState({
              stage: 'DownloadCode',
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
            className="btn btn-primary"
            disabled={this.state.loading}
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              generateCode({
                variables: {
                  identity: this.props.wallet,
                  website: this.state.website
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

  renderDownloadButton() {
    return (
      <button
        className="btn btn-primary"
        onClick={() => {
          this.setState({
            stage: 'VerifyCode'
          })

          this.downloadVerificationFile()
        }}
        children={fbt('Download', 'Download')}
      />
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyWebsiteMutation}
        onCompleted={res => {
          const result = res.verifyWebsite

          if (!result.success) {
            this.setState({ error: result.reason, loading: false, data: null })
            return
          }

          this.setState({
            data: result.data,
            loading: false,
            completed: true,
            shouldClose: true
          })
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console', loading: false })
        }}
      >
        {verifyCode => (
          <button
            className="btn btn-primary"
            onClick={() => {
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  website: this.state.website
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

  downloadVerificationFile = () => {
    const element = document.createElement('a')
    const file = new Blob([this.state.code], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${this.props.wallet}.html`
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
  }
}

export default withIsMobile(WebsiteAttestation)

require('react-styl')(`
  .attestation-modal
    > div .verification-code .form-control.website-verification-code
      height: 6rem
      max-width: 24rem
      resize: none

    .error-alert
      word-wrap: break-word;
`)
