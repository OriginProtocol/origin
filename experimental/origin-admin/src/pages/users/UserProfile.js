import React from 'react'
import { Tag } from '@blueprintjs/core'

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
        <div style={{ fontWeight: 'bold', marginBottom: 10 }}>{`${
          profile.firstName
        } ${profile.lastName} `}</div>
        {!profile.description ? null : (
          <div style={{ marginBottom: 10 }}>{profile.description}</div>
        )}
        {profile.emailVerified ? <Verified>Email</Verified> : null}
        {profile.phoneVerified ? <Verified>Phone</Verified> : null}
        {profile.facebookVerified ? <Verified>Facebook</Verified> : null}
        {profile.twitterVerified ? <Verified>Twitter</Verified> : null}
        {profile.airbnbVerified ? <Verified>Airbnb</Verified> : null}
      </div>
    </div>
  )
}

export default UserProfile
