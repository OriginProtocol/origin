import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import pick from 'lodash/pick'

import Modal from 'components/Modal'
import CountryDropdown from './_CountryDropdown'

import GeneratePhoneCodeMutation from 'mutations/GeneratePhoneCode'
import VerifyPhoneCodeMutation from 'mutations/VerifyPhoneCode'

class PhoneAttestation extends Component {
  state = {
    active: 'us',
    dropdown: true,
    stage: 'GenerateCode',
    phone: '',
    code: '',
    prefix: '1',
    method: 'sms'
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
        className={`attestation-modal phone${
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
        <h2>Verify your Phone Number</h2>
        <div className="instructions">
          Enter your phone number below and OriginID will send you a
          verification code via SMS.
        </div>
        <div className="d-flex mt-3">
          <CountryDropdown
            onChange={({ code, prefix }) =>
              this.setState({ active: code, prefix })
            }
            active={this.state.active}
          />
          <div className="form-control-wrap">
            <input
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
        <div className="help">
          Other users will know that you have a verified phone number. Your
          actual phone number will not be published on the blockchain.
        </div>
        <div className="actions">
          {this.renderCodeButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children="Cancel"
          />
          <button
            className="btn btn-link"
            onClick={() => {
              this.props.onComplete({
                topic: '10',
                issuer: '0xf17f52151EbEF6C7334FAD080c5704D77216b732',
                signature:
                  '0x3226075acca86687a5d8918e1880bc63878b45e444ad9de98a3a070823c74cc844c8648c9a88d2554793377659211b93dc55781e1ee0c23e5ec8f03549b1ac3e1c',
                data:
                  '0xcaa54e1b0a1dbfc8e1ecf2baef72247781ea07547f878d8b29b21543d990a365'
              })
              this.setState({ shouldClose: true })
            }}
            children="Fake"
          />
        </div>
      </>
    )
  }

  renderVerifyCode() {
    return (
      <>
        <h2>Verify your Phone Number</h2>
        <div className="instructions">Enter the code we sent you below</div>
        <div className="my-3 verification-code">
          <input
            ref={ref => (this.inputRef = ref)}
            className="form-control form-control-lg"
            placeholder="Verification code"
            value={this.state.code}
            onChange={e => this.setState({ code: e.target.value })}
          />
          {this.state.error && (
            <div className="alert alert-danger mt-3">{this.state.error}</div>
          )}
        </div>
        <div className="actions">
          {this.renderVerifyButton()}
          <button
            className="btn btn-link"
            onClick={() => this.setState({ shouldClose: true })}
            children="Cancel"
          />
        </div>
      </>
    )
  }

  renderCodeButton() {
    return (
      <Mutation
        mutation={GeneratePhoneCodeMutation}
        onCompleted={res => {
          const result = res.generatePhoneCode
          if (result.success) {
            this.setState({ stage: 'VerifyCode' })
          } else {
            this.setState({ error: result.reason })
          }
        }}
        onError={errorData => {
          console.log('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {generateCode => (
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.setState({ error: false })
              generateCode({
                variables: pick(this.state, ['prefix', 'method', 'phone'])
              })
            }}
            children="Continue"
          />
        )}
      </Mutation>
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyPhoneCodeMutation}
        onCompleted={res => {
          const result = res.verifyPhoneCode
          console.log(result)
          if (result.success) {
            this.setState({ stage: 'VerifiedOK' })
          } else {
            this.setState({ error: result.reason })
          }
        }}
        onError={errorData => {
          console.log('Error', errorData)
          this.setState({ error: 'Check console' })
        }}
      >
        {verifyCode => (
          <button
            className="btn btn-outline-light"
            onClick={() => {
              this.setState({ error: false })
              verifyCode({
                variables: {
                  identity: this.props.wallet,
                  prefix: this.state.prefix,
                  phone: this.state.phone,
                  code: this.state.code
                }
              })
            }}
            children="Continue"
          />
        )}
      </Mutation>
    )
  }

  renderVerifiedOK() {
    return (
      <>
        <h2>Phone number verified!</h2>
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
            onClick={() => this.setState({ shouldClose: true })}
            children="Continue"
          />
        </div>
      </>
    )
  }
}

export default PhoneAttestation

require('react-styl')(`
  .attestation-modal.phone
    overflow: visible !important
    padding-bottom: 1.5rem !important
    > div
      h2
        background: url(images/identity/verification-shape-grey.svg) no-repeat center;
        background-size: 7rem;
        padding-top: 9rem;
        background-position: center top;
        position: relative
        &::before
          content: ""
          position: absolute;
          top: 0;
          left: 0;
          height: 7.5rem;
          right: 0;
          background-image: url(images/identity/phone-icon-dark.svg);
          background-size: 2rem;
          background-repeat: no-repeat;
          background-position: center;
      font-size: 18px
      .form-control-wrap
        flex: 1
      .form-control
        background-color: var(--dark-two)
        border: 0
        color: var(--white)
        &::-webkit-input-placeholder
          color: var(--dusk)
      .help
        font-size: 14px
        margin-top: 1rem
      .verification-code
        display: flex;
        flex-direction: column;
        align-items: center;
        .form-control
          max-width: 15rem
          text-align: center
      .actions
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 1.5rem
        .btn-link
          margin-top: 1rem
          text-decoration: none

    &.success
      > div
        h2
          color: var(--greenblue)
          background-image: url(images/circular-check-button.svg)
          background-size: 3.5rem;
          padding-top: 5rem;
          &::before
            background-image: none
        .actions
          margin-bottom: 1.5rem
`)
