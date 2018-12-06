import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

import Link from 'components/Link'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
import HelpProfile from './_HelpProfile'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
  }
`

class OnboardProfile extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <>
        <div className="step">Step 4</div>
        <h3>Enter Your Profile Information</h3>
        <div className="row">
          <div className="col-md-8">
            <Stage stage={4} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                const nextLink = `/listings/${listing.id}/onboard/attestations`

                return (
                  <div className="onboard-box">
                    <div className="profile-logo">
                      <div className="cam" />
                    </div>
                    <form className="profile">
                      <div className="form-group">
                        <label>First Name</label>
                        <input type="text" className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>Last Name</label>
                        <input type="text" className="form-control" />
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-control"
                          placeholder="Tell us a bit about yourself"
                        />
                      </div>
                    </form>
                    <Link to={nextLink} className="btn btn-primary">
                      Continue
                    </Link>
                  </div>
                )
              }}
            </Query>
          </div>
          <div className="col-md-4">
            <ListingPreview listing={listing} />
            <HelpProfile />
          </div>
        </div>
      </>
    )
  }
}

export default OnboardProfile

require('react-styl')(`
  .onboard .onboard-box
    .profile-logo
      width: 11rem
      height: 11rem
      background: #233040 url(images/avatar-blue.svg) no-repeat center bottom
      background-size: 63%
      border-radius: 1rem
      margin-top: -5rem
      position: relative
      .cam
        width: 2.5rem
        height: 2.5rem
        background: url(images/camera-icon-circle.svg) no-repeat center
        background-size: 100%
        position: absolute
        bottom: 0.5rem
        right: 0.5rem

    form.profile
      width: 75%
      text-align: left
      margin-top: 1rem
      label
        font-weight: normal
        color: black
        font-size: 18px
      .form-control
        font-size: 18px
        background-color: var(--pale-grey-eight)
        border-color: var(--light)
        &::-webkit-input-placeholder
          color: var(--bluey-grey)
      input.form-control
        padding-top: 1.5rem
        padding-bottom: 1.5rem
      textarea
        min-height: 10rem

`)
