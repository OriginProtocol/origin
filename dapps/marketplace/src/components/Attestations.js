import React from 'react'
import { mapVerifiedAttestations } from 'utils/profileTools'

const Attestations = ({ profile = {} }) => {
  const verifiedAttestations = mapVerifiedAttestations(profile)

  return (
    <div className="attestations">
      {verifiedAttestations.emailVerified && (
        <div className="attestation email" />
      )}
      {verifiedAttestations.phoneVerified && (
        <div className="attestation phone" />
      )}
      {verifiedAttestations.facebookVerified && (
        <div className="attestation facebook" />
      )}
      {verifiedAttestations.twitterVerified && (
        <div className="attestation twitter" />
      )}
      {verifiedAttestations.airbnbVerified && (
        <div className="attestation airbnb" />
      )}
      {verifiedAttestations.googleVerified && (
        <div className="attestation google" />
      )}
      {verifiedAttestations.websiteVerified && (
        <div className="attestation website" />
      )}
      {verifiedAttestations.kakaoVerified && (
        <div className="attestation kakao" />
      )}
      {verifiedAttestations.githubVerified && (
        <div className="attestation github" />
      )}
      {verifiedAttestations.linkedinVerified && (
        <div className="attestation linkedin" />
      )}
      {verifiedAttestations.wechatVerified && (
        <div className="attestation wechat" />
      )}
    </div>
  )
}

export default Attestations
