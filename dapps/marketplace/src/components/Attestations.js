import React from 'react'
import { fbt } from 'fbt-runtime'

import Tooltip from 'components/Tooltip'

const getVerifiedTooltip = provider => {
  switch (provider) {
    case 'email':
      return fbt('Email Verified', 'Email Verified')
    case 'phone':
      return fbt('Phone Verified', 'Phone Verified')
    case 'website':
      return fbt('Website Verified', 'Website Verified')
    case 'airbnb':
      return fbt('Airbnb Account Verified', 'Airbnb Account Verified')
    case 'github':
      return fbt('GitHub Account Verified', 'GitHub Account Verified')
    case 'facebook':
      return fbt('Facebook Account Verified', 'Facebook Account Verified')
    case 'twitter':
      return fbt('Twitter Account Verified', 'Twitter Account Verified')
    case 'google':
      return fbt('Google Account Verified', 'Google Account Verified')
    case 'kakao':
      return fbt('Kakao Account Verified', 'Kakao Account Verified')
    case 'linkedin':
      return fbt('LinkedIn Account Verified', 'LinkedIn Account Verified')
    case 'wechat':
      return fbt('WeChat Account Verified', 'WeChat Account Verified')
  }

  return provider
}

const Attestations = ({ profile = {}, small }) => {
  const verifiedAttestations = profile.verifiedAttestations

  if (!verifiedAttestations) {
    return null
  }

  return (
    <div className={`attestations${small ? ' attestations-small' : ''}`}>
      {verifiedAttestations.map(attestation => (
        <Tooltip
          key={attestation.id}
          placement="bottom"
          tooltip={getVerifiedTooltip(attestation.id)}
        >
          <div className={`attestation ${attestation.id}`} />
        </Tooltip>
      ))}
    </div>
  )
}

export default Attestations

require('react-styl')(`
  .attestations
    display: flex
  .attestation
    background-repeat: no-repeat
    background-position: center
    background-size: 60%
    width: 2rem
    height: 2rem
    margin-right: 0.5rem
    border-width: 2px
    border-style: solid
    border-radius: 50%
    &:last-of-type
      margin-right: 0
    &.email
      border-color: #1ec68e
      background-color: rgba(#1ec68e, 60%)
      background-image: url(images/identity/email-icon-light.svg)
    &.facebook
      border-color: #2d4a89
      background-size: 35%
      background-color: rgba(#2d4a89, 75%)
      background-image: url(images/identity/facebook-icon-light.svg)
    &.phone
      border-color: #e8b506
      background-size: 36%
      background-color: rgba(#e8b506, 75%)
      background-image: url(images/identity/phone-icon-light.svg)
    &.twitter
      border-color: #169aeb
      background-color: rgba(#169aeb, 75%)
      background-image: url(images/identity/twitter-icon-light.svg)
    &.airbnb
      border-color: #ee4f54
      background-color: rgba(#ee4f54, 75%)
      background-size: 75%
      background-image: url(images/identity/airbnb-icon-light.svg)
    &.google
      border-color: #4086f7
      background-color: rgba(#4086f7, 75%)
      background-image: url(images/identity/google-icon.svg)
    &.website
      border-color: #6331dd
      background-color: rgba(#6331dd, 75%)
      background-image: url(images/identity/website-icon-light.svg)

  .attestations-small .attestation
    width: 1.5rem
    height: 1.5rem
    border-width: 1px
    margin-right: 0.25rem

`)
