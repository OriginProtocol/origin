import React, { Fragment, useState } from 'react'
import { fbt } from 'fbt-runtime'
import { Link } from 'react-router-dom'
import { formatTokens, getContentToShare } from 'utils/growthTools'

const GrowthEnum = require('Growth$FbtEnum')

function Action(props) {
  const {
    type,
    status,
    reward,
    unlockConditions,
    listingId,
    titleKey,
    detailsKey,
    iconSrc
  } = props.action

  const detailsEmpty =
    !detailsKey || detailsKey === 'growth.purchase.empty.details'
  const { isMobile, onMobileLockClick } = props

  const actionLocked = status === 'Inactive'
  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  const [detailsToggled, toggleDetails] = useState(false)

  let foregroundImgSrc
  let title
  let isVerificationAction = true
  let buttonLink = '/profile'
  let externalLink
  const buttonOnClick = () => {
    window.scrollTo(0, 0)
  }

  if (type === 'Email') {
    foregroundImgSrc = 'images/growth/email-icon.svg'
    title = fbt('Verify your Email', 'RewardActions.emailTitle')
  } else if (type === 'Profile') {
    foregroundImgSrc = 'images/growth/profile-icon.svg'
    title = fbt('Add name and photo to profile', 'RewardActions.profileTitle')
  } else if (type === 'Phone') {
    foregroundImgSrc = 'images/growth/phone-icon.svg'
    title = fbt('Verify your Phone Number', 'RewardActions.phoneTitle')
  } else if (type === 'Twitter') {
    foregroundImgSrc = 'images/growth/twitter-icon.svg'
    title = fbt('Verify your Twitter Profile', 'RewardActions.twitterTitle')
  } else if (type === 'Airbnb') {
    foregroundImgSrc = 'images/growth/airbnb-icon.svg'
    title = fbt('Verify your Airbnb Profile', 'RewardActions.airbnbTitle')
  } else if (type === 'Facebook') {
    foregroundImgSrc = 'images/growth/facebook-icon.svg'
    title = fbt('Verify your Facebook Profile', 'RewardActions.facebookTitle')
  } else if (type === 'Google') {
    foregroundImgSrc = 'images/growth/google-icon.svg'
    title = fbt('Verify your Google Profile', 'RewardActions.googleTitle')
  } else if (type === 'Website') {
    foregroundImgSrc = 'images/growth/website-icon.svg'
    title = fbt('Verify your Website', 'RewardActions.websiteTitle')
  } else if (type === 'Kakao') {
    foregroundImgSrc = 'images/growth/kakao-icon.svg'
    title = fbt('Verify your Kakao Profile', 'RewardActions.kakaoTitle')
  } else if (type === 'WeChat') {
    foregroundImgSrc = 'images/growth/wechat-icon.svg'
    title = fbt('Verify your Wechat Profile', 'RewardActions.wechatTitle')
  } else if (type === 'GitHub') {
    foregroundImgSrc = 'images/growth/github-icon.svg'
    title = fbt('Verify your GitHub Profile', 'RewardActions.githubTitle')
  } else if (type === 'LinkedIn') {
    foregroundImgSrc = 'images/growth/linkedin-icon.svg'
    title = fbt('Verify your LinkedIn Profile', 'RewardActions.linkedInTitle')
  } else if (type === 'Telegram') {
    foregroundImgSrc = 'images/growth/telegram-badge.svg'
    title = fbt('Verify your Telegram Profile', 'RewardActions.telegramTitle')
  } else if (type === 'ListingCreated') {
    foregroundImgSrc = 'images/growth/purchase-icon.svg'
    title = fbt('Create a Listing', 'RewardActions.listingCreatedTitle')
    buttonLink = '/create'
    isVerificationAction = false
  } else if (type === 'ListingPurchased') {
    foregroundImgSrc = 'images/growth/purchase-icon.svg'
    title = fbt('Purchase a Listing', 'RewardActions.listingPurchasedTitle')
    buttonLink = '/'
    isVerificationAction = false
  } else if (type === 'ListingIdPurchased') {
    foregroundImgSrc = iconSrc
    title = (
      <Fragment>
        <fbt desc="growth">
          <fbt:enum enum-range={GrowthEnum} value={titleKey} />
        </fbt>
      </Fragment>
    )
    buttonLink = `/listing/${listingId}`
    isVerificationAction = false
  } else if (type === 'ListingSold') {
    foregroundImgSrc = 'images/growth/sell-icon.svg'
    title = fbt('Sell a Listing', 'RewardActions.listingSoldTitle')
    buttonLink = '/create'
    isVerificationAction = false
  } else if (type === 'TwitterShare') {
    buttonLink = undefined
    foregroundImgSrc = 'images/growth/twitter-icon.svg'
    title = fbt('Share this on Twitter', 'RewardActions.tweetThis')
    externalLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      getContentToShare(props.action, props.locale)
    )}`
  } else if (type === 'FacebookShare') {
    buttonLink = undefined
    foregroundImgSrc = 'images/growth/facebook-icon.svg'
    title = fbt('Share this on Facebook', 'RewardActions.postThisOnFacebook')
    externalLink = [
      'https://www.facebook.com/dialog/share?',
      `app_id=${process.env.FACEBOOK_CLIENT_ID}`,
      `&href=${encodeURIComponent(props.action.content.link)}`,
      '&display=popup'
    ].join('')
  } else if (type === 'TwitterFollow') {
    buttonLink = undefined
    foregroundImgSrc = 'images/growth/twitter-icon.svg'
    title = fbt('Follow us on Twitter', 'RewardActions.followOnTwitter')
    // TODO: Move screen name to Enviroment variable
    externalLink =
      'https://twitter.com/intent/follow?screen_name=OriginProtocol'
  } else if (type === 'TelegramFollow') {
    buttonLink = undefined
    foregroundImgSrc = 'images/growth/telegram-badge.svg'
    title = fbt('Join us on Telegram', 'RewardActions.followOnTelegram')
    // TODO: Move screen name to Enviroment variable
    externalLink = 'tg://resolve?domain=@originprotocol'
  } else if (type === 'FacebookLike') {
    buttonLink = undefined
    foregroundImgSrc = 'images/growth/facebook-icon.svg'
    title = fbt('Like our Facebook Page', 'RewardActions.likePageOnFacebook')
    externalLink = 'https://www.facebook.com/originprotocol/'
  }

  const renderReward = (amount, style = 'normal') => {
    return (
      <div
        className={`reward d-flex align-items-left pl-2 justify-content-center ${
          isMobile ? 'pr-0' : ''
        } align-items-center flex-grow-1`}
      >
        {style === 'normal' && <img src="images/ogn-icon.svg" />}
        {style === 'grayed-out' && <img src="images/ogn-icon-grayed-out.svg" />}
        <div className={`value ${style}`}>
          {formatTokens(amount, props.decimalDivision)}
        </div>
      </div>
    )
  }

  const isInteractable = !actionCompleted && !actionLocked
  const showUnlockModalOnClick =
    actionLocked && isMobile && unlockConditions.length > 0

  const unlockConditionText = (
    <Fragment>
      <fbt desc="RewardActions.requires">Requires:</fbt>{' '}
      {unlockConditions
        .map(unlockCondition => {
          return GrowthEnum[unlockCondition.messageKey] ? (
            <fbt desc="growth">
              <fbt:enum
                enum-range={GrowthEnum}
                value={unlockCondition.messageKey}
              />
            </fbt>
          ) : (
            'Missing translation'
          )
        })
        .join(', ')}
    </Fragment>
  )

  const wrapIntoInteraction = actionComponent => {
    return (
      <Fragment>
        {isInteractable && (
          <div className="with-border">
            {buttonLink && (
              <Link
                to={buttonLink}
                className="mt-auto mb-auto"
                onClick={() => buttonOnClick()}
              >
                {actionComponent}
              </Link>
            )}
            {externalLink && (
              <a
                href={externalLink}
                target="_blank"
                className="mt-auto mb-auto external-link"
                rel="noopener noreferrer"
                onClick={() =>
                  props.onActionClick && props.onActionClick(props.action)
                }
              >
                {actionComponent}
              </a>
            )}
            {!buttonLink && !externalLink && (
              <div className="mt-auto mb-auto" onClick={() => buttonOnClick()}>
                {actionComponent}
              </div>
            )}
          </div>
        )}
        {!isInteractable && !showUnlockModalOnClick && actionComponent}
        {showUnlockModalOnClick && (
          <div
            className="mt-auto mb-auto with-border"
            onClick={() => onMobileLockClick(unlockConditionText)}
          >
            {actionComponent}
          </div>
        )}
      </Fragment>
    )
  }

  const detailsLink = !detailsEmpty && (
    <div
      className={`toggle-details mr-1 mr-md-3`}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        toggleDetails(!detailsToggled)
      }}
    >
      {detailsToggled ? (
        <fbt desc="RewardActions.lessDetails">Less Details</fbt>
      ) : (
        <fbt desc="RewardActions.viewDetails">View Details</fbt>
      )}
    </div>
  )

  return wrapIntoInteraction(
    <div
      className={`action with-border ${isInteractable ? 'active' : ''} ${
        isMobile ? 'mobile' : ''
      }`}
    >
      <div className="d-flex action-main">
        <div className="col-2 col-md-1 pr-0 pl-0 d-flex justify-content-center align-items-center">
          <div className="listing-icon-holder">
            {type === 'ListingIdPurchased' ? (
              <img className={type.toLowerCase()} src={foregroundImgSrc} />
            ) : (
              <div className="icon-holder">
                <img className="verification-icon" src={foregroundImgSrc} />
              </div>
            )}
            {isMobile && actionLocked && (
              <img
                className={`status-icon ${
                  isVerificationAction ? 'verification' : ''
                }`}
                src="images/growth/lock-icon.svg"
              />
            )}
            {isMobile && actionCompleted && (
              <img
                className={`status-icon ${
                  isVerificationAction ? 'verification' : ''
                }`}
                src="images/growth/green-tick-icon.svg"
              />
            )}
          </div>
        </div>
        <div
          className={`d-flex flex-column p-2 p-md-3 justify-content-center col-7 col-md-8`}
        >
          <div className="title">{title}</div>
          {actionLocked && !isMobile && unlockConditions.length > 0 && (
            <Fragment>
              <div className="requirement pr-2 d-flex align-items-center ">
                {unlockConditionText}
              </div>
            </Fragment>
          )}
          {!actionLocked && detailsLink}
        </div>
        <div className="pr-0 pr-md-3 pl-0 pl-md-3 col-3 col-md-3 d-flex align-items-center justify-content-end">
          {reward !== null &&
            renderReward(
              reward.amount,
              actionCompleted ? 'grayed-out' : 'normal'
            )}
          {!actionCompleted && !actionLocked && !isMobile && (
            <div className="btn btn-primary mt-2 mb-2">
              <img className="button-caret" src="images/caret-white.svg" />
            </div>
          )}
          {!isMobile && actionLocked && (
            <img className="status-icon" src="images/growth/lock-icon.svg" />
          )}
          {!isMobile && actionCompleted && (
            <img
              className="status-icon"
              src="images/growth/green-tick-icon.svg"
            />
          )}
        </div>
      </div>
      {detailsEmpty || !detailsToggled ? null : (
        <div className="details">
          <fbt desc="growth">
            <fbt:enum enum-range={GrowthEnum} value={detailsKey} />
          </fbt>
        </div>
      )}
    </div>
  )
}

export default Action

require('react-styl')(`
  .growth-campaigns.container
    .action
      min-height: 80px
      color: var(--dark)
      .action-main
        padding: 30px 20px
      .listing-icon-holder
        position:relative
        .status-icon
          position: absolute
          right: -5px
          bottom: -5px
          &.verification
            right: -4px
            bottom: 4px
      .verification-icon
        width: 3.5rem
      .icon-holder
        position: relative
      .background
        width: 60px
      .profile
        position: absolute
        left: 16.5px
        top: 16px
        width: 27px
      .listingsold
        position: absolute
        left: 12px
        top: 15px
        width: 37px
      .listingpurchased
        position: absolute
        left: 13px
        top: 17px
        width: 35px
      .listingidpurchased
        width: 60px
        border-radius: 5px
      .referral
        position: absolute
        left: 15px
        top: 16px
        width: 29px
      .status-icon
        width: 2.5rem
      .image-holder
        position: relative
      .title
        font-size: 21px
        font-weight: bold
        line-height: 1.25
      .info-text
        font-size: 18px
        font-weight: 300
      .reward
        padding-right: 10px
        height: 28px
        font-size: 18px
        font-weight: bold
        color: var(--clear-blue)
      .reward
        .value
          padding-bottom: 1px
          &.grayed-out
            color: #c0cbd4
      .sub-text
        font-size: 14px
        font-weight: normal
        color: var(--dusk)
      .reward img
        margin-right: 6px
        width: 20px
      .requirement
        color: var(--dusk)
        font-size: 14px
        font-weight: normal
      .details
        color: var(--dusk)
        font-size: 14px
        font-weight: normal
        background-color: #f7f8f8
        text-align: center
        border-radius: 5px
        padding: 10px 40px
        margin-bottom: 10px
      .btn
        border-radius: 15rem
        width: 2.5rem
        height: 2.5rem
        padding-left: 0.6rem
      .button-caret
        transform: rotate(90deg)
        width: 20px
        margin-bottom: 3px
      .button-holder
        padding-left: 0px
      .placeholder
        width: 40px
      .toggle-details
        font-size: 14px
        font-weight: normal
        white-space: nowrap
        color: var(--clear-blue)
    .external-link
      .action .title
        position: relative
        &:after
          content: ' '
          display: inline-block
          height: 100%
          width: 1rem
          background-image: url('images/growth/link-icon.svg')
          background-size: 1rem
          background-position: center
          background-repeat: no-repeat
          position: absolute
          margin-left: 10px
  .growth-campaigns.container.mobile
    .action
      min-height: 80px
      .verification-icon
        width: 2.375rem
      .action-main
        padding: 18px 0px
      .background
        width: 2.5rem
      .reward .value
        font-size: 14px
      .listingsold
        left: 9px
        top: 10px
        width: 24.5px
      .listingpurchased
        left: 0px
        top: 0px
        width: 23px
      .title
        font-size: 14px
        line-height: 1.1rem
        // only allow 2 lines of height in the title
        max-height: 2.2rem
        overflow: hidden
      .btn
        border-radius: 7rem
        width: 1.65rem
        height: 1.65rem
        padding-left: 0.6rem
      .button-caret
        width: 16px
        margin-bottom: 15px
        margin-left: -4px
      .status-icon
        width: 1rem
        &.verification
          right: -2px
          bottom: 0px
      .listingpurchased
        left: 13px
        top: 17px
        width: 35px
      .listingidpurchased
        width: 44px
`)
