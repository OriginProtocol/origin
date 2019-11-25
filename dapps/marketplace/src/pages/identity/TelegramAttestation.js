import React, { Component, useEffect } from 'react'
import { useLazyQuery, useMutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import { withRouter } from 'react-router-dom'

import get from 'lodash/get'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import PublishedInfoBox from 'components/_PublishedInfoBox'

import GenerateTelegramCodeMutation from 'mutations/GenerateTelegramCode'
import CheckTelegramStatusQuery from 'queries/CheckTelegramStatus'

const TelegramVerifyAttestation = ({
  identity,
  onComplete,
  onError,
  isMobile
}) => {
  const [loadStatus, { data, error }] = useLazyQuery(CheckTelegramStatusQuery, {
    variables: {
      identity,
      maxTries: 30
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only'
  })

  useEffect(() => {
    if (!isMobile) {
      loadStatus()
      return
    }

    // Note: Starting the poll after a few seconds of delay
    // This is because, on mobile, the query gets terminated when
    // app is backgrounded.
    const timeout = setTimeout(() => loadStatus(), 5000)

    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (error) {
      console.error('error', error)
      onError(
        <fbt desc="checkTelegramStatus.failed">
          Failed to verify status. Please try again.
        </fbt>
      )
    }
  }, [error])

  const response = get(data, 'checkTelegramStatus', {})
  const verified = get(data, 'checkTelegramStatus.data.verified', false)
  const attestation = get(data, 'checkTelegramStatus.data.attestation', null)

  useEffect(() => {
    if (verified) {
      onComplete(attestation)
    } else if (response.reason) {
      onError(response.reason)
    }
  }, [data, verified, response])

  return (
    <button
      className="btn btn-primary"
      disabled={true}
      onClick={loadStatus}
      children={<fbt desc="Loading...">Loading...</fbt>}
    />
  )
}

const TelegramGenerateCode = ({ wallet, onComplete, onError }) => {
  const [generateTelegramCode] = useMutation(GenerateTelegramCodeMutation)

  useEffect(() => {
    if (!wallet) {
      return
    }

    generateTelegramCode({
      variables: {
        identity: wallet
      }
    })
      .then(res => {
        const result = res.data.generateTelegramCode
        onComplete(result)
      })
      .catch(res => {
        onError(res)
      })
  }, [wallet])

  return null
}

class TelegramAttestation extends Component {
  constructor() {
    super()

    this.state = {
      loading: true
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const ModalComponent = this.props.isMobile ? MobileModal : Modal

    const canGoBack =
      this.props.isMobile &&
      this.props.history.length &&
      this.props.location.pathname.endsWith('/telegram')

    return (
      <ModalComponent
        title={fbt('Verify Account', 'TelegramAttestation.verifyAccount')}
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
        onBack={!canGoBack ? null : () => this.props.history.goBack()}
        slideUp={false}
      >
        <div>{this.renderVerifyCode()}</div>
      </ModalComponent>
    )
  }

  renderVerifyCode() {
    const { isMobile, isMobileApp } = this.props
    const { openedLink, loading } = this.state

    const header = isMobile ? null : (
      <fbt desc="TelegramAttestation.title">Verify Your Telegram Account</fbt>
    )

    if (isMobile && !isMobileApp) {
      return (
        <>
          <div className="alert alert-danger mt-3">
            <fbt desc="TelegramAttestation.onlyOnOrigin">
              Telegram Attestation is only available through the Origin
              Marketplace app.
            </fbt>
          </div>
          <div className="actions">
            <button
              className="btn btn-link"
              type="button"
              onClick={() => this.setState({ shouldClose: true })}
              children={fbt('Cancel', 'Cancel')}
            />
          </div>
        </>
      )
    }

    return (
      <>
        <TelegramGenerateCode
          wallet={this.props.wallet}
          onComplete={result => {
            if (!result.success) {
              this.setState({
                error: result.reason,
                loading: false,
                code: null
              })
              return
            }

            this.setState({
              loading: false,
              code: result.code
            })
          }}
          onError={err => {
            console.error(err)

            this.setState({
              error: 'Error: Check console',
              loading: false,
              code: null
            })
          }}
        />
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
          {!openedLink && loading && (
            <button
              className="btn btn-primary"
              type="button"
              disabled={true}
              children={<fbt desc="Loading...">Loading...</fbt>}
            />
          )}
          {!openedLink && !loading && (
            <a
              href={`https://t.me/${
                process.env.TELEGRAM_BOT_USERNAME
              }?start=${encodeURIComponent(this.state.code)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              onClick={() => {
                this.setState({
                  openedLink: true,
                  error: null,
                  data: null
                })
              }}
              children={<fbt desc="Continue">Continue</fbt>}
            />
          )}
          {openedLink && (
            <TelegramVerifyAttestation
              identity={this.props.wallet}
              onComplete={data => {
                this.setState({
                  data,
                  loading: false,
                  completed: true,
                  shouldClose: true,
                  openedLink: false
                })
              }}
              onError={error => {
                this.setState({
                  error,
                  loading: false,
                  data: null,
                  openedLink: false
                })
              }}
              isMobile={isMobile}
            />
          )}
          {!isMobile && (
            <button
              className="btn btn-link"
              type="button"
              onClick={() =>
                this.setState({ shouldClose: true, openedLink: false })
              }
              children={fbt('Cancel', 'Cancel')}
            />
          )}
        </div>
      </>
    )
  }
}

export default withRouter(withWallet(withIsMobile(TelegramAttestation)))
