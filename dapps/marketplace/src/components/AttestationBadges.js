import React from 'react'

const AttestationBadges = ({ className, providers, minCount = 10, fillToNearest = 5, onClick }) => {
  
  let badges = providers || []

  if (badges.length < minCount) {
    badges = badges.concat(new Array(minCount - badges.length).fill(null))
    // Show a minimum of `minCount` icons
  } else if (badges.length > minCount && (badges % fillToNearest !== zero)) {
    // Show icons in multiples of `fillToNearest`
    const lengthToAppend = (fillToNearest - (badges.length % fillToNearest))
    badges = badges.concat(new Array(lengthToAppend).fill(null))
  }

  return (
    <div className={`attestation-badges${className ? ' ' + className : ''}`}>
      {badges.map((badge, index) => {
        if (!badge) {
          return <div key={index} className="attestation-badge"></div>
        }

        let rewardElement

        let classList = ' active'

        if (badge.disabled || badge.soon) {
          classList = ' disabled'
        } else if (badge.verified) {
          classList += ' verified'
        } else if (badge.reward) {
          rewardElement = (
            <div className="badge-label reward">{badge.reward}</div>
          )
        }

        return (
          <div key={badge.id} className={`attestation-badge${classList} ${badge.id}`} onClick={() => {
            if (onClick) {
              onClick(badge.id)
            }
          }}>
            {rewardElement}
          </div>
        )
      })}
    </div>
  )
}

export default AttestationBadges

require('react-styl')(`
  .attestation-badges
    margin-top: 1.5rem
    text-align: center
    .attestation-badge
      display: inline-block
      width: 6rem
      height: 6rem
      border-radius: 50%
      border: dashed 1px #c2cbd3
      flex: auto 1 1
      margin: 0.5rem
      background-repeat: no-repeat
      background-position: center
      position: relative
      &.active
        border: solid 6px #c2cbd3
        cursor: pointer
      &.disabled
        background-color: #dfe6ea
        border-color: #dfe6ea
      &.verified:after
        content: ''
        display: inline-block
        position: absolute
        height: 28px
        width: 28px
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3)
        border: solid 2px var(--white)
        background-color: var(--greenblue)
        border-radius: 50%
        background-image: url('images/identity/verification-shape-green.svg')
        background-size: 28px
        bottom: -0.3rem
        right: -0.3rem
      &.email
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #1ec68e
          background-color: #27d198
      &.phone
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #e8b506
          background-color: #f4c111
      &.facebook
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #2d4a89
          background-color: #3a5997
      &.twitter
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #169aeb
          background-color: #1fa1f1
      &.airbnb
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #ee4f54
          background-color: #ff5b60
      &.website
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #6331dd
          background-color: #6e3bea
      &.google
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #1ec68e
          background-color: #27d198
      &.wechat
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #00b500
          background-color: #02c602
      &.kakao
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #ebd500
          background-color: #ffe815
      &.github
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #1ec68e
          background-color: #27d198
      &.linkedin
        background-image: url('images/identity/mail-icon-small.svg')
        &.active
          border-color: #1ec68e
          background-color: #27d198

      .badge-label
        position: absolute
        border-radius: 15px
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3)
        background-color: var(--white)
        color: var(--clear-blue)
        font-family: Lato
        font-size: 0.9rem
        font-weight: 900
        font-style: normal
        font-stretch: normal
        line-height: 1
        letter-spacing: normal
        padding: 0.25rem 8px 0.25rem 6px
        bottom: -0.3rem
        right: -1.5rem
        display: flex
        align-items: center
        &.reward
          &:before
            content: ''
            background-image: url('images/ogn-icon.svg')
            height: 1rem
            width: 1rem
            background-size: 0.9rem
            background-position: center
            background-repeat: no-repeat
            display: inline-block
            margin-right: 5px

  @media (max-width: 767.98px)
    .attestation-badges
      .attestation-badge
        width: 75px
        height: 75px
`)