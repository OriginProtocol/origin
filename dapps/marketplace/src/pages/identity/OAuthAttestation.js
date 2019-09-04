import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import withIsMobile from 'hoc/withIsMobile'

import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import AutoMutate from 'components/AutoMutate'
import PublishedInfoBox from 'components/_PublishedInfoBox'

import VerifyOAuthAttestation from 'mutations/VerifyOAuthAttestation'
import query from 'queries/GetAuthUrl'

import { getProviderDisplayName } from 'utils/profileTools'

function InfoStoredOnChain({ provider }) {
  const providerName = getProviderDisplayName(provider)

  let content = (
    <fbt desc="OAuthAttestation.verify.explanation">
      Other users will know that you have a verified{' '}
      <fbt:param name="provider">{providerName}</fbt:param> account, but your
      account details will not be published on the blockchain. We will never
      post on your behalf.
    </fbt>
  )

  switch (provider) {
    case 'facebook':
      content = fbt(
        'Your Facebook account ID',
        'OAuthAttestation.onChain.facebook'
      )
      break

    case 'twitter':
      content = fbt(
        'Your Twitter username and account ID',
        'OAuthAttestation.onChain.twitter'
      )
      break

    case 'google':
      content = fbt('Your Google account ID', 'OAuthAttestation.onChain.google')
      break

    case 'kakao':
      content = fbt('Your Kakao account ID', 'OAuthAttestation.onChain.kakao')
      break

    case 'wechat':
      content = fbt('Your Wechat account ID', 'OAuthAttestation.onChain.wechat')
      break

    case 'github':
      content = fbt(
        'Your GitHub username and account ID',
        'OAuthAttestation.onChain.github'
      )
      break

    case 'linkedin':
      content = fbt(
        'Your LinkedIn username',
        'OAuthAttestation.onChain.linkedin'
      )
      break
  }

  return (
    <PublishedInfoBox
      className="mt-auto"
      pii={true}
      title={fbt(
        'What will be visible on the blockchain?',
        'OAuthAttestation.visibleOnBlockchain'
      )}
      children={content}
    />
  )
}

class OAuthAttestation extends Component {
  constructor(props) {
    super(props)
    this.state = {
      stage: 'GenerateCode'
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { isMobile, provider } = this.props

    const didOpen = !prevProps.open && this.props.open,
      didChangeStage = prevState.stage !== this.state.stage
    if (this.inputRef && (didOpen || didChangeStage)) {
      this.inputRef.focus()
    }

    if (provider === 'google' && !prevProps.isMobile && isMobile) {
      // Check wether the current browser is WebView in order to block Google OAuth and warn the user
      const isWebView = /(iPhone|iPod|iPad)(?!.*Safari)|Android.*(wv|\.0\.0\.0)|Version\/_*.*_|WebView/.test(
        window.navigator.userAgent
      )
      // Determin mobile platform to render the correct App Download link
      const mobilePlatform = /(iPhone|iPod|iPad)/.test(
        window.navigator.userAgent
      )
        ? 'ios'
        : 'android/other'
      this.setState({ isForbidden: isWebView, mobilePlatform })
    }
  }

  render() {
    if (!this.props.open) {
      return null
    }

    const { isMobile } = this.props
    const { origin, pathname } = window.location
    const { provider } = this.props
    const redirect = isMobile
      ? encodeURIComponent(`${origin}${pathname}#/profile/${provider}`)
      : null

    const ModalComp = isMobile ? MobileModal : Modal

    return (
      <ModalComp
        title={
          <fbt desc="OAuthAttestation.verifyAccount">
            Verify{' '}
            <fbt:param name="provider">
              {getProviderDisplayName(provider)}
            </fbt:param>{' '}
            Account
          </fbt>
        }
        className={`${provider} attestation-modal oauth`}
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
          this.props.history.replace('/profile')
        }}
        lightMode={true}
        skipAnimateOnExit={this.props.skipAnimateOnExit}
      >
        <Query
          query={query}
          variables={{ redirect, provider }}
          fetchPolicy="network-only"
          skip={get(this.props, 'match.params.attestation') ? true : false}
        >
          {({ data }) => {
            const authUrl = get(data, 'identityEvents.GetAuthUrl')
            return (
              <div>
                {this[`render${this.state.stage}`]({
                  authUrl,
                  redirect
                })}
              </div>
            )
          }}
        </Query>
      </ModalComp>
    )
  }

  renderAppDownloadButton() {
    return (
      <>
        <a
          className="btn btn-primary"
          href={
            this.state.mobilePlatform === 'ios'
              ? 'https://itunes.apple.com/us/app/apple-store/id1446091928?mt=8'
              : 'https://originprotocol.com/mobile'
          }
        >
          <fbt desc="OAuthAttestation.getAppButton">Get the Origin App</fbt>
        </a>
      </>
    )
  }

  renderGenerateCode({ authUrl, redirect }) {
    const { isMobile } = this.props
    const { isForbidden } = this.state
    const providerName = getProviderDisplayName(this.props.provider)

    const header =
      isMobile && !isForbidden ? (
        <fbt desc="OAuthAttestation.tapToBegin">
          Tap the button below to begin
        </fbt>
      ) : isMobile && isForbidden ? (
        <fbt desc="OAuthAttestation.getAppHeader">
          Get the Origin Marketplace App
        </fbt>
      ) : (
        <fbt desc="OAuthAttestation.verify">
          Verify your <fbt:param name="provider">{providerName}</fbt:param>{' '}
          Account
        </fbt>
      )

    return (
      <>
        <h2>{header}</h2>
        {!isForbidden && (
          <div className="help mt-0 mb-3">
            <fbt desc="OAuthAttestation.neverPost">
              We will never post on your behalf.
            </fbt>
          </div>
        )}
        {this.state.error && (
          <div className="alert alert-danger mt-3">{this.state.error}</div>
        )}
        {isForbidden ? (
          <PublishedInfoBox
            title={fbt('Unsupported Browser', 'OAuthAttestation.unsupported')}
            pii={true}
          >
            <fbt desc="OAuthAttestation.unsupportedInfo">
              Your browser does not support Google verification. Please use our
              mobile app instead.
            </fbt>
          </PublishedInfoBox>
        ) : (
          <InfoStoredOnChain provider={this.props.provider} />
        )}
        <div className="actions mt-5">
          {isForbidden
            ? this.renderAppDownloadButton()
            : this.renderVerifyButton({ authUrl, redirect })}
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

  renderVerifyButton({ authUrl, redirect }) {
    const matchSid = window.location.href.match(/sid=([a-zA-Z0-9_-]+)/i)
    const sid = matchSid && matchSid[1] ? matchSid[1] : null

    return (
      <Mutation
        mutation={VerifyOAuthAttestation}
        onCompleted={res => {
          const result = res.verifyOAuthAttestation
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
        {verifyCode => {
          const runMutation = () => {
            if (this.state.loading) return
            this.setState({ error: false, loading: true })
            verifyCode({
              variables: {
                provider: this.props.provider,
                identity: this.props.wallet,
                redirect,
                authUrl,
                code: sid
              }
            })
          }
          return (
            <>
              {sid && this.props.wallet ? (
                <AutoMutate mutation={runMutation} />
              ) : null}
              <button
                className="btn btn-primary"
                onClick={runMutation}
                children={
                  this.state.loading
                    ? fbt('Loading...', 'Loading...')
                    : fbt('Continue', 'Continue')
                }
                disabled={this.state.isForbidden}
              />
            </>
          )
        }}
      </Mutation>
    )
  }
}

export default withIsMobile(withRouter(OAuthAttestation))

require('react-styl')(`
  .mobile-modal-light .attestation-modal.oauth:not(.success) h2
    padding-top: 9rem
`)
