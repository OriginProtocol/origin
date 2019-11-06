import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import { withRouter } from 'react-router-dom'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import withIsMobile from 'hoc/withIsMobile'
import withMessagingStatus from 'hoc/withMessagingStatus'
import MobileModal from 'components/MobileModal'
import EmailAttestation from 'pages/identity/EmailAttestation'

import Redirect from 'components/Redirect'
import HelpOriginWallet from 'components/DownloadApp'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

import LoadingSpinner from 'components/LoadingSpinner'

import {
  updateVerifiedAccounts,
  getVerifiedAccounts,
  clearVerifiedAccounts
} from 'utils/profileTools'

import Store from 'utils/store'

const localStore = Store('localStorage')

class OnboardEmail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      finished: false,
      hasIdentity: false
    }
  }

  componentDidUpdate(prevProps) {
    const shouldUpdate = [
      this.props.identityLoaded !== prevProps.identityLoaded,
      this.props.identity !== prevProps.identity,
      this.props.finished !== prevProps.finished,
      this.props.wallet !== prevProps.wallet
    ].reduce((prev, current) => prev || current, false)

    if (!shouldUpdate) {
      return
    }

    if (
      this.props.identityLoaded &&
      this.props.identity &&
      !this.props.finished
    ) {
      this.setState({
        finished: true,
        hasIdentity: true
      })
    } else if (this.props.wallet !== prevProps.wallet) {
      const storedAccounts = getVerifiedAccounts({
        wallet: this.props.wallet
      })
      if (
        storedAccounts &&
        storedAccounts.emailAttestation &&
        !this.props.finished
      ) {
        this.setState({ finished: true })
      }
    }
  }

  render() {
    const {
      linkPrefix,
      wallet,
      walletType,
      hasMessagingKeys,
      messagingStatusLoading
    } = this.props
    const { finished, hasIdentity } = this.state

    if (messagingStatusLoading) {
      return <LoadingSpinner />
    }

    if (finished) {
      let link = '/onboard/profile'
      const onboardCompleted = localStore.get(`${wallet}-onboarding-completed`)

      if (hasIdentity) {
        if (onboardCompleted && hasMessagingKeys) {
          // Back to where you came from.
          link = '/onboard/back'
        } else if (walletType === 'Origin Wallet') {
          // Keys are injected in Origin Wallet, so skip `messaging` step
          link = '/onboard/rewards'
        } else if (!hasMessagingKeys) {
          link = '/onboard/messaging'
        }
      }

      return <Redirect to={`${linkPrefix}${link}`} />
    }

    return this.renderContent()
  }

  renderContent() {
    const { isMobile, listing, hideOriginWallet, wallet } = this.props
    const content = (
      <EmailAttestation
        wallet={wallet}
        onboarding={true}
        onCompleted={data => this.onCompleted(data)}
      />
    )

    if (isMobile) {
      return (
        <MobileModal
          title={fbt('Create a profile', 'UserActivation.createProfile')}
          onBack={() => this.props.history.goBack()}
          className="profile-email"
        >
          {content}
        </MobileModal>
      )
    }

    return (
      <>
        <h1 className="mb-1">
          <fbt desc="onboard.Profile.createAccount">Create an Account</fbt>
        </h1>
        <p className="description mb-5">
          <fbt desc="onboard.Profile.description">
            Create a basic profile so others will know who you are in the Origin
            Marketplace.
          </fbt>
        </p>
        <div className="row">
          <div className="col-md-8">
            <div className="onboard-box profile-email">
              <div className="pt-3">{content}</div>
            </div>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            {hideOriginWallet ? null : <HelpOriginWallet />}
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }

  onCompleted(data) {
    if (data) {
      updateVerifiedAccounts({
        wallet: this.props.wallet,
        data: {
          emailAttestation: data
        }
      })
      this.setState({ finished: true })
    } else {
      clearVerifiedAccounts()
    }
  }
}

export default withRouter(
  withIsMobile(withWallet(withIdentity(withMessagingStatus(OnboardEmail))))
)

require('react-styl')(`
  .onboard .onboard-box.profile-email
    padding: 4rem 4rem 2rem 4rem

    h2
      font-family: var(--heading-font)
      font-size: 28px
      line-height: 1.67
      color: #000000
      font-weight: 300

    form
      input
        text-align: center
`)
