import React from 'react'

const ProfileStrength = ({ width = '0' }) => (
  <div className="profile-strength">
    <div className="title">
      Profile Strength
      <div className="pct">25%</div>
    </div>
    <div className="progress">
      <div className="progress-bar" style={{ width }} />
    </div>
  </div>
)

export default ProfileStrength

require('react-styl')(`
  .profile-strength
    font-family: Poppins
    font-size: 24px
    margin-bottom: 2rem
    .title
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
    .pct
      font-weight: normal
    .progress
      background-color: var(--pale-grey)
      height: 6px
      .progress-bar
        background-color: var(--greenblue)
`)
