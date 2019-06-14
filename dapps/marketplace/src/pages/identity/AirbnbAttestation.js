import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

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

  isMobile() {
    return this.props.ismobile === 'true'
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const ModalComponent = this.isMobile() ? MobileModal : Modal

    return (
      <ModalComponent
        title={fbt('Verify Airbnb Account', 'VerifyAirbnb.verifyAirbnbAccount')}
        className={`attestation-modal airbnb${
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
      >
        <div>{this[`render${this.state.stage}`]()}</div>
      </ModalComponent>
    )
  }

  renderGenerateCode() {
    const isMobile = this.isMobile()

    const header = isMobile ? null : (
      <fbt desc="VerifyAirbnb.averifyAirbnbAccount">
        Verify your Airbnb account
      </fbt>
    )

    const storedOnChain = isMobile ? (
      <div className="info yellow mt-auto">
        <span className="title">
          <fbt desc="VerifyAirbnb.visibleOnBlockchain">
            What will be visible on the blockchain?
          </fbt>
        </span>
        <fbt desc="VerifyAirbnb.yourAirbnbId">Your Airbnb user ID</fbt>
      </div>
    ) : (
      <div className="help">
        <fbt desc="VerifyAirbnb.airbnbProfilePublished">
          Other users will know that you have a verified Airbnb profile and your
          user id will be published on the blockchain.
        </fbt>
      </div>
    )

    return (
      <>
        <h2>{header}</h2>
        <div className="instructions">
          <fbt desc="VerifyAirbnb.enterAirbnbProfileUrl">
            Enter Airbnb profile URL below
          </fbt>
        </div>
        <div className="mt-5">
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
        {storedOnChain}
        <div className={`actions mt-5`}>
          {this.renderCodeButton()}
          {!isMobile && (
            <button
              className="btn btn-link"
              type="button"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'Cancel')}
            />
          )}
        </div>
      </>
    )
  }

  renderVerifyCode() {
    const isMobile = this.isMobile()

    const header = isMobile ? null : (
      <fbt desc="VerifyAirbnb.averifyAirbnbAccount">
        Verify your Airbnb account
      </fbt>
    )

    return (
      <>
        <h2>{header}</h2>
        <div className="instructions">
          <fbt desc="VerifyAirbnb.enterCodeIntoAirbnb">
            Go to the Airbnb website, edit your profile and paste the following
            text into profile description:
          </fbt>
        </div>
        <div className="my-3 verification-code">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg airbnb-verification-code"
            value={this.state.code}
            readOnly
            type="text"
          />
          <button
            type="button"
            className="btn copy-btn"
            onClick={() => {
              this.inputRef.select()
              document.execCommand('copy')
            }}
          >
            <fbt desc="VerifyAirbnb.copy">Copy</fbt>
          </button>
        </div>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        <div className="help">
          <fbt desc="VerifyAirbnb.continueToConfirmationCodeCheck">
            Continue once the confirmation code is entered in your Airbnb
            profile.
          </fbt>
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          {!isMobile && (
            <button
              className="btn btn-link"
              type="button"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'Cancel')}
            />
          )}
        </div>
      </>
    )
  }

  renderCodeButton() {
    const isMobile = this.isMobile()

    return (
      <Mutation
        mutation={GenerateAirbnbCodeMutation}
        onCompleted={res => {
          const result = res.GenerateAirbnbCodeMutation

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
                  airbnbUserId: this.state.airbnbUserId
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

  renderVerifyButton() {
    const isMobile = this.isMobile()

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
            className="btn btn-primary"
            disabled={this.state.loading}
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
}

export default withIsMobile(AirbnbAttestation)

require('react-styl')(`
  .attestation-modal 
    > div 
      .verification-code
        display: flex
        flex-direction: row
        max-width: 24rem
        margin: 0 auto
        border: solid 1px #c2cbd3
        border-radius: 0.3rem
        .form-control.airbnb-verification-code
          flex: auto
          text-align: left
          border: 0
        .btn.copy-btn
          flex: auto 0 0
          width: auto
          border: 0
          border-radius: 0
          border-left: 1px solid #c2cbd3
          cursor: pointer
    .info
      text-align: center
      border-radius: 5px
      border: solid 1px var(--bluey-grey)
      background-color: rgba(152, 167, 180, 0.1)
      font-family: Lato
      font-size: 14px
      color: black
      padding: 10px
      margin-top: 1rem
      .title
        display: block
        font-weight: bold
        margin-bottom: 3px
        & ~ a
          margin-left: 5px
      &.yellow
        border: solid 1px var(--golden-rod)
        background-color: rgba(244, 193, 16, 0.1)
      &.white
        border: solid 1px #c2cbd3
        background-color: white
        display: flex
        text-align: left
`)
