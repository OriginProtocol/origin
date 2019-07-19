import React from 'react'
import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

const ProfileStrength = ({ published = 0, unpublished = 0, large, isMobile }) => {
  const title = isMobile
    ? fbt('Strength', 'ProfileStrength.Strength')
    : fbt('Profile Strength', 'ProfileStrength.ProfileStrength')

  return (
    <div className={`profile-strength${large ? ' large' : ''}`}>
      <div className="title">
        {title}
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
}

export default withIsMobile(ProfileStrength)

require('react-styl')(`
  .profile-strength
    font-size: 1.1rem
    margin-bottom: 2.5rem
    &.large
      font-size: 1.5rem
    .title
      display: flex
      justify-content: space-between
      margin-bottom: 0.5rem
      font-family: Poppins
      font-size: 18px
      font-weight: 300
      line-height: 1.06
      color: var(--dark)
    .pct
      font-family: Lato
      line-height: 1.36
    .progress
      background-color: var(--pale-grey)
      box-shadow: inset 0 0 1.5px var(--bluey-grey)
      height: 6px
      .progress-bar
        background-color: var(--greenblue)

  @media (max-width: 767.98px)
    .profile-strength
      margin-bottom: 1.5rem
      .title
        font-size: 0.9rem
        padding: 0 12px
        font-family: Lato
        line-height: 1.36
        .pct
          font-size: 0.9rem
          font-weight: 900
          color: var(--greenblue)

`)
