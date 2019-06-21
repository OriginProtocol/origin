import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import withWallet from 'hoc/withWallet'
import withIsMobile from 'hoc/withIsMobile'
import MobileModal from 'components/MobileModal'
import EmailAttestation from 'pages/identity/EmailAttestation'

import Redirect from 'components/Redirect'
import HelpOriginWallet from './_HelpOriginWallet'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

import {
  updateVerifiedAccounts,
  getVerifiedAccounts,
  clearVerifiedAccounts
} from 'utils/profileTools'

class OnboardEmail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      finished: false
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.walletProxy !== prevProps.walletProxy) {
      const storedAccounts = getVerifiedAccounts({ wallet: this.props.walletProxy })
      if (storedAccounts && storedAccounts.emailAttestation) {
        this.setState({
          finished: true
        })
      }
    }
  }

  render() {
    const { linkPrefix } = this.props
    const { finished, back } = this.state

    if (finished) {
      return <Redirect to={`${linkPrefix}/onboard/profile`} />
    } else if (back) {
      return <Redirect to={`${linkPrefix}/onboard/back`} />
    }

    return this.renderContent()
  }

  renderContent() {
    const { isMobile, listing, hideOriginWallet, walletProxy } = this.props
    const content = (
      <EmailAttestation
        wallet={walletProxy}
        onboarding={true}
        onCompleted={data => this.onCompleted(data)}
      />
    )

    if (isMobile) {
      return (
        <MobileModal
          title={fbt(
            'Create a profile',
            'UserActivation.createProfile'
          )}
          onBack={() => this.onCompleted()}
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
              <div className="pt-3">
                {content}
              </div>
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
        wallet: this.props.walletProxy,
        data: {
          emailAttestation: data
        }
      })
      this.setState({
        finished: true
      })
    } else {
      clearVerifiedAccounts()
      this.setState({
        back: true
      })
    }
  }
}

export default withIsMobile(withWallet(OnboardEmail))

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
