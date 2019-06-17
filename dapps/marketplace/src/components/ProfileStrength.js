import React from 'react'
import { fbt } from 'fbt-runtime'

import useIsMobile from 'utils/useMobile'

const ProfileStrength = ({ published = 0, unpublished = 0, large }) => {
  const isMobile = useIsMobile()

  const title = isMobile ? fbt('Strength', 'ProfileStrength.Strength') :  fbt('Profile Strength', 'ProfileStrength.ProfileStrength')

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

export default ProfileStrength

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
      font-style: normal
      font-stretch: normal
      line-height: 1.06
      letter-spacing: normal
      color: var(--dark)
    .pct
      font-family: Lato
      font-weight: normal
      font-style: normal
      font-stretch: normal
      line-height: 1.36
      letter-spacing: normal
    .progress
      background-color: var(--pale-grey)
      border: solid 1px var(--pale-grey-two)
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
