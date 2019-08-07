import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import PublishedInfoBox from 'components/_PublishedInfoBox'
import CountryDropdown from './_CountryDropdown'

import GenerateTelegramCodeMutation from 'mutations/GenerateTelegramCode'
import VerifyTelegramCodeMutation from 'mutations/VerifyTelegramCode'

class TelegramAttestation extends Component {
  state = {
    active: 'us',
    dropdown: true,
    stage: 'GenerateCode',
    phone: '',
    code: '',
    prefix: '1'
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
        title={fbt(
          'Verify Telegram Account',
          'TelegramAttestation.verifyTelegramNumber'
        )}
        className="attestation-modal telegram"
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
      <fbt desc="TelegramAttestation.title">Verify your Telegram Account</fbt>
    )

    // TODO: Update this
    const helpText = null

    return (
      <Mutation
        mutation={GenerateTelegramCodeMutation}
        onCompleted={res => {
          const result = res.generateTelegramCode
          if (result.success) {
            this.setState({ stage: 'VerifyCode', loading: false })
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
          <form
            onSubmit={e => {
              e.preventDefault()
              if (this.state.loading) return
              this.setState({ error: false, loading: true })
              generateCode({
                variables: {
                  phone: `${this.state.prefix}${this.state.phone}`
                }
              })
            }}
          >
            <h2>{header}</h2>
            <div className="instructions mb-3">
              <fbt desc="TelegramAttestation.description">
                Enter your 10-digit phone number below
              </fbt>
            </div>
            <div className="d-flex my-3">
              <CountryDropdown
                onChange={({ code, prefix }) =>
                  this.setState({ active: code, prefix })
                }
                active={this.state.active}
              />
              <div className="form-control-wrap">
                <input
                  type="tel"
                  ref={ref => (this.inputRef = ref)}
                  className="form-control form-control-lg"
                  placeholder="Area code and phone number"
                  value={this.state.phone}
                  onChange={e => this.setState({ phone: e.target.value })}
                />
              </div>
            </div>
            {this.state.error && (
              <div className="alert alert-danger mt-3">{this.state.error}</div>
            )}
            <div className="help mt-3 mb-3">{helpText}</div>
            <PublishedInfoBox
              className="mt-3 mb-0"
              title={
                <fbt desc="TelegramAttestation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              }
              children={
                <fbt desc="TelegramAttestation.verifiedButNotNumber">
                  That you have a verified telegram account, but NOT your actual
                  phone number or username
                </fbt>
              }
            />
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.state.loading}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              {!isMobile && (
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => this.setState({ shouldClose: true })}
                  children={fbt('Cancel', 'Cancel')}
                />
              )}
            </div>
          </form>
        )}
      </Mutation>
    )
  }

  renderVerifyCode() {
    const { isMobile } = this.props

    const header = isMobile ? null : (
      <fbt desc="TelegramAttestation.title">Verify your Telegram Account</fbt>
    )

    return (
      <Mutation
        mutation={VerifyTelegramCodeMutation}
        onCompleted={res => {
          const result = res.verifyTelegramCode

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
          <form
            onSubmit={e => {
              e.preventDefault()
              if (this.state.loading) return
              this.setState({ error: false, loading: true })

              const trimmedCode = this.state.code.trim()

              if (trimmedCode.length === 0) {
                this.setState({
                  error: 'Verification code is required',
                  loading: false
                })
                return
              }

              if (trimmedCode.length !== 6 || isNaN(trimmedCode)) {
                this.setState({
                  error: 'Verification code should be a 6 digit number',
                  loading: false
                })
                return
              }

              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  phone: `${this.state.prefix}${this.state.phone}`,
                  code: this.state.code
                }
              })
            }}
          >
            <h2>{header}</h2>
            <div className="instructions">
              <fbt desc="TelegramAttestation.mobile.enterCode">
                Enter the code from your Telegram App
              </fbt>
            </div>
            <div className="my-3 verification-code">
              <input
                type="tel"
                maxLength="6"
                ref={ref => (this.inputRef = ref)}
                className="form-control form-control-lg"
                placeholder="Verification code"
                value={this.state.code}
                onChange={e => this.setState({ code: e.target.value })}
              />
            </div>
            {this.state.error && (
              <div className="alert alert-danger my-3">{this.state.error}</div>
            )}
            <PublishedInfoBox
              className="mt-3 mb-0"
              title={
                <fbt desc="TelegramAttestation.visibleOnBlockchain">
                  What will be visible on the blockchain?
                </fbt>
              }
              children={
                <fbt desc="TelegramAttestation.verifiedButNotNumber">
                  That you have a verified Telegram account, but NOT your actual
                  Telegram username or phone number
                </fbt>
              }
            />
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={this.state.loading}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              {!isMobile && (
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => this.setState({ shouldClose: true })}
                  children={fbt('Cancel', 'Cancel')}
                />
              )}
            </div>
          </form>
        )}
      </Mutation>
    )
  }
}

export default withWallet(withIsMobile(TelegramAttestation))
