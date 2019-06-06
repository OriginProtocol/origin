import React from 'react'

const Attestations = ({ profile = {} }) => (
  <div className="attestations">
    {profile.emailVerified && <div className="attestation email" />}
    {profile.phoneVerified && <div className="attestation phone" />}
    {profile.facebookVerified && <div className="attestation facebook" />}
    {profile.twitterVerified && <div className="attestation twitter" />}
    {profile.airbnbVerified && <div className="attestation airbnb" />}
    {profile.googleVerified && <div className="attestation google" />}
    {profile.websiteVerified && <div className="attestation website" />}
  </div>
)

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
      background-color: rgba(#2d4a89, 75%)
      background-image: url(images/identity/facebook-icon-light.svg)
    &.phone
      border-color: #e8b506
      background-size: 45%
      background-color: rgba(#e8b506, 75%)
      background-image: url(images/identity/phone-icon-light.svg)
    &.twitter
      border-color: #169aeb
      background-color: rgba(#169aeb, 75%)
      background-image: url(images/identity/twitter-icon-light.svg)
    &.airbnb
      border-color: #ee4f54
      background-color: rgba(#ee4f54, 75%)
      background-image: url(images/identity/airbnb-icon-light.svg)
    &.google
      border-color: #e8b506
      background-color: rgba(#e8b506, 75%)
      background-image: url(images/identity/google-icon-light.svg)
    &.website
      border-color: #6331dd
      background-color: rgba(#6331dd, 75%)
      background-image: url(images/identity/website-icon-light.svg)

`)
