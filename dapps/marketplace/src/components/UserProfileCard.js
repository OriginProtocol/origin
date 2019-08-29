import React, { Component } from 'react'

import withIsMobile from 'hoc/withIsMobile'

import { fbt } from 'fbt-runtime'

import Avatar from './Avatar'
import ProfileStrength from './ProfileStrength'
import Earnings from './Earning'
import Attestations from './Attestations'
import SendMessage from './SendMessage'

class UserProfileCard extends Component {
  render() {
    // TBD: Should this take these many arguments? Or can we just pass the `profile` and destructure it here?
    const {
      wallet,
      avatarUrl,
      onEdit,
      firstName,
      lastName,
      description,
      profileStrength,
      tokensEarned,
      maxEarnable,
      verifiedAttestations,
      showMessageLink,
      isMobile
    } = this.props

    const hasProfileStrength = !Number.isNaN(parseInt(profileStrength))
    const shouldShowEarnings = !!maxEarnable

    const hasWallet = !!wallet
    const walletAddress = !hasWallet ? null : (
      <span className="wallet-address">{`${wallet.slice(0, 4)}...${wallet.slice(
        -4
      )}`}</span>
    )

    return (
      <div className="user-profile-component">
        <div className="profile-info-container">
          <div className="avatar-container">
            <Avatar avatarUrl={avatarUrl} />
            {!onEdit ? null : (
              <a className="profile-edit-icon" onClick={onEdit} />
            )}
          </div>
          <div className="user-bio-container">
            <h2>
              {`${firstName} ${lastName}`}
              {isMobile || !hasWallet ? null : walletAddress}
            </h2>
            <div className="description">{description}</div>
            {!isMobile || !hasWallet ? null : walletAddress}
            <Attestations
              className="verified-attestations"
              profile={{ verifiedAttestations }}
              small
            />
            {showMessageLink && (
              <SendMessage
                to={wallet}
                className="btn btn-outline-primary btn-rounded mt-3"
              >
                <fbt desc="contactUser">Contact</fbt>
              </SendMessage>
            )}
          </div>
        </div>
        {(hasProfileStrength || shouldShowEarnings) && (
          <div className="user-progress-container">
            {hasProfileStrength && (
              <div className="profile-strength-container">
                <ProfileStrength published={profileStrength} />
              </div>
            )}
            {shouldShowEarnings && (
              <div className="user-earnings-container">
                <Earnings total={maxEarnable} earned={tokensEarned} />
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

export default withIsMobile(UserProfileCard)

require('react-styl')(`
  .user-profile-component
    .profile-info-container
      display: flex
      flex-direction: row
      padding: 1rem
      .avatar-container
        flex: auto 0 0
        padding: 0.5rem 0
        position: relative
        .avatar
          width: 110px
          height: 110px
        .profile-edit-icon
          position: absolute
          background-image: url('images/edit-icon.svg')
          background-position: center
          background-repeat: no-repeat
          background-size: 1.6rem
          display: inline-block
          height: 2rem
          width: 2rem
          right: -0.3rem
          bottom: 0.3rem
          cursor: pointer
      .user-bio-container
        flex: auto 1 1
        padding: 0 2rem
        h2
          font-family: Poppins
          font-size: 2.25rem
          font-weight: 500
          color: var(--dark)
          margin-bottom: 0.5rem
        .wallet-address
          font-family: Lato
          font-size: 0.75rem
          font-weight: normal
          font-style: normal
          font-stretch: normal
          line-height: normal
          letter-spacing: normal
          color: #6a8296
          margin-left: 0.75rem
        .description
          font-family: Lato
          font-size: 1rem
          font-weight: 300
          line-height: 1.56
          color: var(--dark)
        .verified-attestations
          margin-top: 1rem
          > div
            width: 1.7rem
            height: 1.7rem
        .btn-link
          font-weight: normal
          padding: 0
          margin-top: 1rem
    .user-progress-container
      margin-top: 1rem
      display: flex
      flex-direction: row
      .profile-strength-container, .user-earnings-container
        flex: 50% 1 1
        padding: 1rem
  
  @media (max-width: 767.98px)
    .user-profile-component
      .user-progress-container
        background-color: white
        box-shadow: 0 1px 0 0 rgba(0, 0, 0, 0.12)
        margin-top: 0
        margin-bottom: 1rem
      .profile-info-container
        background-color: white
        flex-direction: column
        .user-bio-container
          text-align: center
          padding: 0
          h2
            margin-top: 1rem
            margin-bottom: 0
            font-size: 1.5rem
          .description
            font-size: 0.75rem
          .verified-attestations
            display: flex
            flex-direction: row
            justify-content: center
          .btn-link
            display: block
            text-align: center
            width: 100%
            margin-top: 0
        .avatar-container
          display: inline-block
          margin: 0 auto
          .avatar
            padding-top: 0
`)
