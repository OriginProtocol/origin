import React from 'react'

const AttestationBadges = ({
  className,
  providers,
  minCount = 10,
  fillToNearest = 5,
  onClick
}) => {
  let badges = providers || []

  if (badges.length < minCount) {
    badges = badges.concat(new Array(minCount - badges.length).fill(null))
    // Show a minimum of `minCount` icons
  } else if (badges.length > minCount && badges.length % fillToNearest !== 0) {
    // Show icons in multiples of `fillToNearest`
    const lengthToAppend = fillToNearest - (badges.length % fillToNearest)
    badges = badges.concat(new Array(lengthToAppend).fill(null))
  }

  return (
    <div className={`attestation-badges${className ? ' ' + className : ''}`}>
      {badges.map((badge, index) => {
        if (!badge) {
          return <div key={index} className="attestation-badge" />
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
          <div
            key={badge.id}
            className={`attestation-badge${classList} ${badge.id}`}
            onClick={() => {
              if (onClick) {
                onClick(badge.id)
              }
            }}
          >
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
      background-size: cover
      position: relative
      &.active
        cursor: pointer
        border: 0
      &.disabled
        background-color: #dfe6ea
        border-color: #dfe6ea
      &.verified:after
        content: ''
        display: inline-block
        position: absolute
        height: 29px
        width: 29px
        box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.3)
        border-radius: 50%
        background-image: url('images/checkmark-icon.svg')
        background-size: auto
        background-position: center
        bottom: -0.1rem
        right: -0.1rem
      &.email
        background-image: url('images/growth/email-icon.svg')
      &.phone
        background-image: url('images/growth/phone-icon.svg')
      &.facebook
        background-image: url('images/growth/facebook-icon.svg')
      &.twitter
        background-image: url('images/growth/twitter-icon.svg')
      &.airbnb
        background-image: url('images/growth/airbnb-icon.svg')
      &.website
        background-image: url('images/growth/website-icon.svg')
      &.google
        background-image: url('images/growth/google-icon.svg')
      &.wechat
        background-image: url('images/growth/wechat-icon.svg')
      &.kakao
        background-image: url('images/growth/kakao-icon.svg')
      &.github
        background-image: url('images/growth/github-icon.svg')
      &.linkedin
        background-image: url('images/growth/linkedin-icon.svg')
      &.telegram
        background-image: url('images/growth/website-icon.svg')

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
        margin: 0.3rem
`)
