import React from 'react'

const Attestations = ({ profile = {} }) => {
  const verifiedAttestations = profile.verifiedAttestations

  if (!verifiedAttestations) {
    return null
  }

  return (
    <div className="attestations">
      {verifiedAttestations.map(attestation => (
        <div key={attestation.id} className={`attestation ${attestation.id}`} />
      ))}
    </div>
  )
}

export default Attestations
