import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import { withRouter } from 'react-router-dom'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import AutoMutate from 'components/AutoMutate'
import TelegramLoginButton from 'components/TelegramLoginButton'
import PublishedInfoBox from 'components/_PublishedInfoBox'

import VerifyTelegramAuthMutation from 'mutations/VerifyTelegramAuth'
import GenerateTelegramCodeMutation from 'mutations/GenerateTelegramCode'
import VerifyTelegramCodeMutation from 'mutations/VerifyTelegramCode'

class TelegramAttestation extends Component {
  constructor() {
    super()

    this.state = {}
  }

  // componentDidUpdate() {
  //   const searchParams = new URLSearchParams(
  //     get(this.props, 'location.search', '')
  //   )

  //   if (
  //     searchParams.has('hash') &&
  //     !this.state.authData &&
  //     !this.props.walletLoading
  //   ) {
  //     this.props.history.replace('/profile')
  //     this.setState({
  //       authData: {
  //         hash: searchParams.get('hash'),
  //         authDate: searchParams.get('auth_date'),
  //         username: searchParams.get('username'),
  //         firstName: searchParams.get('first_name'),
  //         lastName: searchParams.get('last_name'),
  //         id: searchParams.get('id'),
  //         photoUrl: searchParams.get('photo_url')
  //       }
  //     })
  //   }
  // }

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

    const header = isMobile ? null : (
      <fbt desc="TelegramAttestation.title">Verify your Telegram Account</fbt>
    )

    return (
      <>
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
          {/* {this.renderAuthorizeButton()} */}
          {this.renderGenerateCode()}
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

          return <AutoMutate
            mutation={runMutation}
          />
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

          if (!result.success) {
            this.setState({ error: result.reason, loading: false, data: null })
            return
          }

          this.setState({
            data: result.data,
            loading: false,
            completed: true,
            shouldClose: true,
            code: null
          })
        }}
        onError={errorData => {
          console.error('Error', errorData)
          this.setState({
            error: 'Check console',
            loading: false,
            code: null
          })
        }}
      >
        {verifyCode => {
          const runMutation = () => {
            if (this.state.loading) return
            this.setState({ error: false, loading: true })

            verifyCode({
              variables: {
                identity: this.props.wallet
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
                    <fbt desc="Continue">Continue</fbt>
                  )
                }
              />
            </>
          )
        }}
      </Mutation>
    )
  }

  // renderAuthorizeButton() {
  //   if (!this.state.authData) {
  //     const { origin, pathname } = window.location

  //     return (
  //       <TelegramLoginButton
  //         redirectURL={`${origin}${pathname}#/profile/telegram`}
  //         buttonText={<fbt desc="Continue">Continue</fbt>}
  //         className="btn btn-primary"
  //       />
  //     )
  //   }

  //   return (
  //     <Mutation
  //       mutation={VerifyTelegramAuthMutation}
  //       onCompleted={res => {
  //         const result = res.verifyTelegramAuth

  //         if (!result.success) {
  //           this.setState({ error: result.reason, loading: false, data: null })
  //           return
  //         }

  //         this.setState({
  //           data: result.data,
  //           loading: false,
  //           completed: true,
  //           shouldClose: true,
  //           authData: null
  //         })
  //       }}
  //       onError={errorData => {
  //         console.error('Error', errorData)
  //         this.setState({
  //           error: 'Check console',
  //           loading: false,
  //           authData: null
  //         })
  //       }}
  //     >
  //       {verifyCode => {
  //         const runMutation = () => {
  //           if (this.state.loading) return
  //           this.setState({ error: false, loading: true })

  //           verifyCode({
  //             variables: {
  //               identity: this.props.wallet,
  //               ...this.state.authData
  //             }
  //           })
  //         }

  //         return (
  //           <>
  //             <AutoMutate mutation={runMutation} />
  //             <button
  //               className="btn btn-primary"
  //               onClick={runMutation}
  //               children={
  //                 this.state.loading ? (
  //                   <fbt desc="Loading...">Loading...</fbt>
  //                 ) : (
  //                   <fbt desc="Continue">Continue</fbt>
  //                 )
  //               }
  //             />
  //           </>
  //         )
  //       }}
  //     </Mutation>
  //   )
  // }
}

export default withWallet(withIsMobile(withRouter(TelegramAttestation)))
