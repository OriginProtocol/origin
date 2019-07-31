import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

import PublishedInfoBox from 'components/_PublishedInfoBox'

import GenerateEmailCodeMutation from 'mutations/GenerateEmailCode'
import VerifyEmailCodeMutation from 'mutations/VerifyEmailCode'

class EmailAttestation extends Component {
  constructor(props) {
    super(props)

    this.state = {
      stage: 'GenerateCode',
      email: props.email || '',
      code: props.code || '',
      data: null
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && didChangeStage) {
      this.inputRef.focus()
    }
  }

  render() {
    return (
      <div
        className={`email-attestation-content${
          this.props.onboarding ? ' onboarding' : ''
        }`}
      >
        {this[`render${this.state.stage}`]()}
      </div>
    )
  }

  renderGenerateCode() {
    const { isMobile, onboarding } = this.props

    let header
    if (isMobile && onboarding) {
      header = (
        <fbt desc="EmailAttestation.onboarding.mobile.enterEmail">
          Enter a valid email address
        </fbt>
      )
    } else if (onboarding) {
      header = (
        <fbt desc="EmailAttestation.onboarding.enterEmail">
          What’s your email address?
        </fbt>
      )
    } else {
      header = (
        <fbt desc="EmailAttestation.title">Verify your Email Address</fbt>
      )
    }

    const placeholder = onboarding
      ? fbt('username@email.com', 'Attestation.onboarding.placeholder')
      : fbt('Verify email address', 'Attestation.verify-email-address')

    const helpText = onboarding ? (
      <fbt desc="Attestation.onboarding.emailNotifications">
        We use your email to send you important notifications when you buy or
        sell.
      </fbt>
    ) : (
      <fbt desc="Attestation.emailPublishClarification">
        By verifying your email, you give Origin permission to send you
        occasional emails such as notifications about your transactions.
      </fbt>
    )

    return (
      <Mutation
        mutation={GenerateEmailCodeMutation}
        onCompleted={res => {
          const result = res.generateEmailCode
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

              const emailRegex = /^[a-z0-9-._+]+@[a-z0-9-]+(\.[a-z]+)*(\.[a-z]{2,})$/i
              if (!emailRegex.test(this.state.email)) {
                this.setState({
                  error: fbt(
                    'This is not a valid email address',
                    'EmailAttestation.invalidEmail'
                  ),
                  loading: false
                })
                return
              }

              generateCode({
                variables: { email: this.state.email }
              })
            }}
          >
            {header ? <h2>{header}</h2> : null}
            {!onboarding && (
              <div className="instructions">
                <fbt desc="Attestation.instructions">
                  Enter your email address below and Origin will send you a
                  verification code
                </fbt>
              </div>
            )}
            <div className="mt-3">
              <input
                type="email"
                ref={ref => (this.inputRef = ref)}
                className="form-control form-control-lg text-center"
                placeholder={placeholder}
                value={this.state.email}
                onChange={e => this.setState({ email: e.target.value })}
              />
            </div>
            {this.state.error && (
              <div className="alert alert-danger mt-3">{this.state.error}</div>
            )}
            <div className="help mb-3">{helpText}</div>
            <PublishedInfoBox
              className="mt-auto"
              title={fbt(
                'What will be visible on the blockchain?',
                'EmailAttestation.visibleOnBlockchain'
              )}
              children={fbt(
                'That you have a verified email, but NOT your actual email address',
                'EmailAttestation.storedOnChain'
              )}
            />
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary btn-rounded"
                disabled={this.state.loading}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
              />
              {!isMobile && !onboarding && (
                <button
                  className="btn btn-link"
                  type="button"
                  onClick={() => this.onCompleted()}
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
    const { isMobile, onboarding } = this.props

    const { email, code } = this.state

    let title
    if (isMobile && onboarding) {
      title = (
        <fbt desc="EmailAttestation.onboarding.mobile.checkMail">
          We emailed you a code
        </fbt>
      )
    } else if (onboarding) {
      title = (
        <fbt desc="EmailAttestation.onboarding.checkMail">
          Please check your email
        </fbt>
      )
    } else {
      title = <fbt desc="EmailAttestation.title">Verify your Email Address</fbt>
    }

    const placeholder = onboarding ? (
      <fbt desc="EmailAttestation.onboarding.enterCode">
        Enter verification code
      </fbt>
    ) : (
      <fbt desc="EmailAttestation.verifyCode">Verification code</fbt>
    )

    return (
      <Mutation
        mutation={GenerateEmailCodeMutation}
        onCompleted={res => {
          const result = res.generateEmailCode
          if (result.success) {
            this.setState({ resending: false })
          } else {
            this.setState({ error: result.reason, resending: false })
          }
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {generateCode => (
          <Mutation
            mutation={VerifyEmailCodeMutation}
            onCompleted={res => {
              const result = res.verifyEmailCode

              if (!result.success) {
                this.setState({
                  error: result.reason,
                  loading: false,
                  data: null
                })
                return
              }

              this.setState(
                {
                  data: result.data,
                  loading: false
                },
                () => this.onCompleted()
              )
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
                      error: fbt(
                        'Verification code is required',
                        'Attestation.missingCode'
                      ),
                      loading: false
                    })
                    return
                  }

                  if (trimmedCode.length !== 6 || isNaN(trimmedCode)) {
                    this.setState({
                      error: fbt(
                        'Verification code should be a 6 digit number',
                        'Attestation.invalidCode'
                      ),
                      loading: false
                    })
                    return
                  }
                  verifyCode({
                    variables: { identity: this.props.wallet, email, code }
                  })
                }}
              >
                {title ? <h2>{title}</h2> : null}
                {!onboarding && (
                  <div className="instructions">
                    <fbt desc="EmailAttestation.enterCode">
                      Enter the code we sent you below
                    </fbt>
                  </div>
                )}
                <div className="my-3 verification-code">
                  <input
                    type="tel"
                    maxLength="6"
                    ref={ref => (this.inputRef = ref)}
                    className="form-control form-control-lg text-center"
                    placeholder={placeholder}
                    value={this.state.code}
                    onChange={e => this.setState({ code: e.target.value })}
                  />
                </div>
                {this.state.error && (
                  <div className="alert alert-danger my-3">
                    {this.state.error}
                  </div>
                )}
                {onboarding && (
                  <div className="help">
                    <fbt desc="UserActivation.emailHelp ">
                      We sent a code to the email address you provided. Please
                      enter it above.
                    </fbt>
                    <a
                      onClick={() => {
                        if (this.state.resending) return
                        this.setState({
                          resending: true
                        })
                        generateCode({
                          variables: {
                            email: this.state.email
                          }
                        })
                      }}
                    >
                      {this.state.resending ? (
                        <fbt desc="UserActivation.resending">Resending...</fbt>
                      ) : (
                        <fbt desc="UserActivation.resendCode">Resend Code</fbt>
                      )}
                    </a>
                  </div>
                )}
                <PublishedInfoBox
                  className="mt-auto"
                  title={fbt(
                    'What will be visible on the blockchain?',
                    'EmailAttestation.visibleOnBlockchain'
                  )}
                  children={fbt(
                    'That you have a verified email but NOT your actual email address',
                    'EmailAttestation.storedOnChain'
                  )}
                />
                <div className="actions">
                  <button
                    type="submit"
                    className="btn btn-primary btn-rounded"
                    disabled={this.state.loading}
                    children={
                      this.state.loading
                        ? fbt('Loading...', 'Loading...')
                        : fbt('Verify', 'Verify')
                    }
                  />
                  {!isMobile && !onboarding && (
                    <button
                      className="btn btn-link"
                      type="button"
                      onClick={() => this.onCompleted()}
                      children={fbt('Cancel', 'Cancel')}
                    />
                  )}
                </div>
              </form>
            )}
          </Mutation>
        )}
      </Mutation>
    )
  }

  onCompleted() {
    if (this.props.onCompleted) {
      this.props.onCompleted(this.state.data)
    }
  }
}

export default withIsMobile(EmailAttestation)

require('react-styl')(`
  .email-attestation-content
    display: flex
    flex-direction: column
    h2
      background-image: url(images/growth/email-icon.svg)
      background-size: 7rem
      padding-top: 9rem
      background-position: center top
      background-repeat: no-repeat
      position: relative
      font-family: Poppins
      font-size: 24px
      font-weight: 500
      line-height: 1.67
      color: #000000
      margin-bottom: 0.75rem
    
    .actions
      width: 50%
      margin: 2rem auto 0 auto

`)
