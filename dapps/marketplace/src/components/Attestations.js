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
