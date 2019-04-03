import React from 'react'

const Attestations = ({ profile = {} }) => (
  <div className="attestations">
    {profile.twitterVerified && <div className="attestation twitter" />}
    {profile.googleVerified && <div className="attestation google" />}
    {profile.phoneVerified && <div className="attestation phone" />}
    {profile.emailVerified && <div className="attestation email" />}
    {profile.facebookVerified && <div className="attestation facebook" />}
    {profile.airbnbVerified && <div className="attestation airbnb" />}
  </div>
)

export default Attestations
