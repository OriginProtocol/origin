import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import AutoMutate from 'components/AutoMutate'
import PublishedInfoBox from 'components/_PublishedInfoBox'

import GenerateTelegramCodeMutation from 'mutations/GenerateTelegramCode'
import VerifyTelegramCodeMutation from 'mutations/VerifyTelegramCode'

class TelegramAttestation extends Component {
  constructor() {
    super()

    this.state = {}
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
            completed: false,
            data: null
          })

          this.props.onClose(completed)
        }}
        lightMode={true}
        skipAnimateOnExit={this.props.skipAnimateOnExit}
      >
        <div>{this.renderVerifyCode()}</div>
      </ModalComponent>
    )
  }

  renderVerifyCode() {
    const { isMobile } = this.props
    const { openedLink } = this.state

    const header = isMobile ? null : (
      <fbt desc="TelegramAttestation.title">Verify your Telegram Account</fbt>
    )

    return (
      <>
        {this.renderGenerateCode()}
        <h2>{header}</h2>
        <div className="instructions mb-3">
          <fbt desc="TelegramAttestation.description">
            We will never post on your behalf.
          </fbt>
        </div>
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
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
              Your Telegram username and account ID
            </fbt>
          }
        />
        <div className="actions">
          {!openedLink && (
            <a
              href={`tg://resolve?domain=${
                process.env.TELEGRAM_BOT_USERNAME
              }&start=${encodeURIComponent(this.state.code)}`}
              className="btn btn-primary"
              onClick={() => {
                this.setState({
                  openedLink: true
                })
              }}
              disabled={this.state.loading}
              children={
                this.state.loading ? (
                  <fbt desc="Loading...">Loading...</fbt>
                ) : (
                  <fbt desc="Continue">Continue</fbt>
                )
              }
            />
          )}
          {openedLink && this.renderVerifyButton()}
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

  renderGenerateCode() {
    return (
      <Mutation
        mutation={GenerateTelegramCodeMutation}
        onCompleted={res => {
          const result = res.generateTelegramCode

          if (!result.success) {
            this.setState({
              error: result.reason,
              loading: false,
              code: null
            })
          }

          this.setState({
            loading: false,
            code: result.code
          })
        }}
      >
        {generateCode => {
          const runMutation = () => {
            if (this.state.loading) return
            this.setState({ error: false, loading: true })

            generateCode({
              variables: {
                identity: this.props.wallet
              }
            })
          }

          return <AutoMutate mutation={runMutation} />
        }}
      </Mutation>
    )
  }

  renderVerifyButton() {
    return (
      <Mutation
        mutation={VerifyTelegramCodeMutation}
        onCompleted={res => {
          const result = res.verifyTelegramCode

          this.unloadIframe()

          if (!result.success) {
            this.setState({
              error: result.reason,
              loading: false,
              data: null,
              openedLink: false
            })
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
          this.setState({
            error: 'Check console',
            loading: false,
            openedLink: false
          })
          this.unloadIframe()
        }}
      >
        {verifyCode => {
          const runMutation = () => {
            if (this.state.loading) return
            this.setState({ error: false, loading: true })

            verifyCode({
              variables: {
                identity: this.props.wallet,
                code: this.state.code
              }
            })
          }

          return (
            <>
              <button
                className="btn btn-primary"
                onClick={runMutation}
                disabled={this.state.loading}
                children={
                  this.state.loading ? (
                    <fbt desc="Loading...">Loading...</fbt>
                  ) : (
                    <fbt desc="Verify">Verify</fbt>
                  )
                }
              />
            </>
          )
        }}
      </Mutation>
    )
  }
}

export default withWallet(withIsMobile(TelegramAttestation))
