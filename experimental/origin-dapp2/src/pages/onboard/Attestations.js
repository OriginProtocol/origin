import React, { Component } from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

// import Link from 'components/Link'
import Modal from 'components/Modal'

import ListingPreview from './_ListingPreview'
import Stage from './_Stage'
import HelpProfile from './_HelpProfile'
import ProfileStrength from './_ProfileStrength'

const query = gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
  }
`

const Attestation = ({ type, text, active, onClick, soon }) => {
  active = active ? ' active' : ''
  soon = soon ? ' soon' : ''
  return (
    <div
      className={`attestation ${type}${active}${soon}`}
      onClick={onClick ? () => onClick() : null}
    >
      <i>
        <span className="bg" />
        <span className="qm active" />
      </i>
      {text}
    </div>
  )
}

class OnboardAttestations extends Component {
  state = {}
  render() {
    const { listing } = this.props
    return (
      <>
        <div className="step">Step 5</div>
        <h3>Strengthen your profile with attestations</h3>
        <div className="row">
          <div className="col-md-8">
            <Stage stage={5} />
            <Query query={query} notifyOnNetworkStatusChange={true}>
              {({ error, data, networkStatus }) => {
                if (networkStatus === 1) {
                  return <div>Loading...</div>
                } else if (error) {
                  return <p className="p-3">Error :(</p>
                } else if (!data || !data.web3) {
                  return <p className="p-3">No Web3</p>
                }

                // const nextLink = `/listings/${listing.id}/onboard/attestations`

                return (
                  <>
                    <div className="onboard-attestations">
                      <Attestation
                        type="phone"
                        active
                        onClick={() => this.setState({ phone: true })}
                        text="Phone Number"
                      />
                      {this.state.phone ? (
                        <Modal onClose={() => this.setState({ phone: false })}>
                          <div>hi</div>
                        </Modal>
                      ) : null}
                      <Attestation type="email" text="Email" />
                      <Attestation type="airbnb" text="Airbnb" />
                      <Attestation type="facebook" text="Facebook" />
                      <Attestation type="twitter" text="Twitter" />
                      <Attestation type="google" text="Google" soon />
                    </div>
                    <ProfileStrength width="25%" />
                    <div className="text-right">
                      <button className="btn btn-primary">Done</button>
                    </div>
                  </>
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

export default OnboardAttestations

require('react-styl')(`
  .onboard-attestations
    display: grid
    grid-column-gap: 0.5rem
    grid-row-gap: 0.5rem
    grid-template-columns: repeat(auto-fill,minmax(220px, 1fr))
    margin-bottom: 2rem

    .attestation.phone i span.bg
      background-image: url(images/identity/phone-icon-light.svg)
      background-size: 1.5rem
    .attestation.email i span.bg
      background-image: url(images/identity/email-icon-light.svg)
      background-size: 2rem
    .attestation.airbnb i span.bg
      background-image: url(images/identity/airbnb-icon-light.svg)
      background-size: 2.8rem
    .attestation.facebook i span.bg
      background-image: url(images/identity/facebook-icon-light.svg)
      background-size: 1.3rem
    .attestation.twitter i span.bg
      background-image: url(images/identity/twitter-icon-light.svg)
      background-size: 2.4rem
    .attestation.google i span.bg
      background-image: url(images/identity/google-icon.svg)
      background-size: 2.4rem

    .attestation
      padding: 2rem
      border: 1px dashed var(--light)
      border-radius: 5px
      display: flex
      flex-direction: column
      align-items: center
      text-align: center
      font-size: 21px
      font-weight: normal
      color: var(--bluey-grey)
      background-color: var(--pale-grey-eight)
      i
        display: block
        position: relative
        background: url(images/identity/verification-shape-grey.svg) no-repeat center;
        width: 5rem;
        height: 5rem;
        background-size: 95%;
        margin-bottom: 1.5rem
        display: flex
        span.bg
          flex: 1
          background-repeat: no-repeat
          background-position: center
        span.qm
          display: none
      &.soon
        opacity: 0.5
      &.active
        background-color: white
        border-style: solid
        color: var(--dusk)
        i
          background-image: url(images/identity/verification-shape-blue.svg)
          span.qm
            display: block
`)
