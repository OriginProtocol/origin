import React from 'react'
import { Tag } from '@blueprintjs/core'

const getDisplayName = provider => {
  switch (provider) {
    case 'email':
      return 'Email'
    case 'phone':
      return 'Phone'
    case 'website':
      return 'Website'
    case 'airbnb':
      return 'Airbnb'
    case 'github':
      return 'GitHub'
    case 'facebook':
      return 'Facebook'
    case 'twitter':
      return 'Twitter'
    case 'google':
      return 'Google'
    case 'kakao':
      return 'Kakao'
    case 'linkedin':
      return 'LinkedIn'
    case 'wechat':
      return 'WeChat'
    case 'telegram':
      return 'Telegram'
  }

  return provider
}

const Verified = props => (
  <Tag intent="success" className="mr-1" rightIcon="tick">
    {props.children}
  </Tag>
)

const UserProfile = ({ profile }) => {
  if (!profile) {
    return 'No profile set up'
  }

  return (
    <div style={{ display: 'flex', alignItems: 'end' }}>
      {!profile.avatar ? null : (
        <img src={profile.avatar} style={{ width: 100 }} />
      )}
      <div style={{ margin: '10px 0 0 15px' }}>
        <div
          style={{ fontWeight: 'bold', marginBottom: 10 }}
        >{`${profile.firstName} ${profile.lastName} `}</div>
        {!profile.description ? null : (
          <div style={{ marginBottom: 10 }}>{profile.description}</div>
        )}
        {profile.verifiedAttestations &&
          profile.verifiedAttestations.map(attestation => {
            return (
              <Verified key={attestation.id}>
                {getDisplayName(attestation.id)}
              </Verified>
            )
          })}
      </div>
    </div>
  )
}

export default UserProfile
