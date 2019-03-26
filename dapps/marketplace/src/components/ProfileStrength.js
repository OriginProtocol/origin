import React from 'react'

const ProfileStrength = ({ published = 0, unpublished = 0, large }) => (
  <div className={`profile-strength${large ? ' large' : ''}`}>
    <div className="title">
      <fbt desc="ProfileStrength.ProfileStrength">Profile Strength</fbt>
      <div className="pct">{`${published + unpublished}%`}</div>
    </div>
    <div className="progress">
      <div
        className="progress-bar published"
        style={{ width: `${published}%` }}
      />
      <div
        className="progress-bar unpublished"
        style={{ width: `${unpublished}%` }}
      />
    </div>
  </div>
)

export default ProfileStrength

require('react-styl')(`
  .profile-strength
    font-size: 18px
    margin-bottom: 2.5rem
    &.large
      font-size: 24px
    .title
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
      font-weight: normal
    .pct
      font-weight: normal
    .progress
      background-color: var(--pale-grey)
      height: 6px
      .progress-bar
        background-color: var(--greenblue)
        &.unpublished
          background-color: var(--clear-blue)

`)
