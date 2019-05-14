import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import UserActivation from 'components/UserActivation'
import HelpOriginWallet from './_HelpOriginWallet'
import ListingPreview from './_ListingPreview'
import HelpProfile from './_HelpProfile'

class OnboardProfile extends Component {
  constructor(props) {
    super(props)
    this.state = {
      finished: false
    }
  }

  render() {
    const { listing, linkPrefix, hideOriginWallet } = this.props
    const { finished } = this.state

    if (finished) {
      return <Redirect to={`${linkPrefix}/onboard/finished`} />
    }

    return (
      <>
        <h1 className="mb-1">
          <fbt desc="onboard.Profile.createAccount">
            Create an Account
          </fbt>
        </h1>
        <p className="description mb-5">
          <fbt desc="onboard.Profile.description">
            Create a basic profile so others will know who you are in the Origin Marketplace.
          </fbt>
        </p>
        <div className="row">
          <div className="col-md-8">
            <div className="onboard-box profile pt-3">
              <UserActivation onCompleted={() => {
                this.setState({
                  finished: true
                })
              }} hideHeader={true} />
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

}

export default OnboardProfile

require('react-styl')(`
  .onboard .onboard-box.profile
    padding: 1rem
    > .user-activation
      max-width: 475px
`)
