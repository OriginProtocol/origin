import React from 'react'

import Tooltip from 'components/Tooltip'
import { getVerifiedTooltip } from 'utils/profileTools'

const Attestations = ({ profile = {}, small, className }) => {
  const verifiedAttestations = profile.verifiedAttestations

  if (!verifiedAttestations || verifiedAttestations.length === 0) {
    return null
  }

  return (
    <div
      className={`attestations${small ? ' attestations-small' : ''}${
        className ? ' ' + className : ''
      }`}
    >
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
    &.github
      background-image: url(images/growth/github-icon.svg)
      background-size: 100%
      border: 0
    &.linkedin
      background-image: url(images/growth/linkedin-icon.svg)
      background-size: 100%
      border: 0
    &.kakao
      background-image: url(images/growth/kakao-icon.svg)
      background-size: 100%
      border: 0
  .attestations-small .attestation
    width: 1.5rem
    height: 1.5rem
    border-width: 1px
    margin-right: 0.25rem

`)
