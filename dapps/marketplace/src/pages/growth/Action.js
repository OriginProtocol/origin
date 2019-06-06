import React, { Fragment, useState } from 'react'
import { fbt } from 'fbt-runtime'
import { Link } from 'react-router-dom'
import numberFormat from 'utils/numberFormat'

const GrowthEnum = require('Growth$FbtEnum')

function Action(props) {
  const {
    type,
    status,
    reward,
    rewardEarned,
    rewardPending,
    unlockConditions,
    listingId,
    titleKey,
    detailsKey,
    iconSrc
  } = props.action

  const { isMobile, onMobileLockClick } = props

  const actionLocked = status === 'Inactive'

  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  let backgroundImgSrc = 'images/identity/verification-shape-blue.svg'
  if (actionCompleted) {
    backgroundImgSrc = 'images/identity/verification-shape-green.svg'
  } else if (actionLocked) {
    backgroundImgSrc = 'images/identity/verification-shape-grey.svg'
  }

  const formatTokens = tokenAmount => {
    return numberFormat(
      web3.utils
        .toBN(tokenAmount)
        .div(props.decimalDivision)
        .toString(),
      2,
      '.',
      ',',
      true
    )
  }

  const [detailsToggled, toggleDetails] = useState(false)

  let foregroundImgSrc
  let title
  let buttonLink = '/profile'
  let buttonOnClick = () => {
    window.scrollTo(0, 0)
  }

  if (type === 'Email') {
    foregroundImgSrc = '/images/identity/email-icon-light.svg'
    title = fbt('Verify your Email', 'RewardActions.emailTitle')
  } else if (type === 'Profile') {
    foregroundImgSrc = '/images/growth/profile-icon.svg'
    title = fbt('Add name and photo to profile', 'RewardActions.profileTitle')
  } else if (type === 'Phone') {
    foregroundImgSrc = '/images/identity/phone-icon-light.svg'
    title = fbt('Verify your Phone Number', 'RewardActions.phoneTitle')
  } else if (type === 'Twitter') {
    foregroundImgSrc = '/images/identity/twitter-icon-light.svg'
    title = fbt('Verify your Twitter Profile', 'RewardActions.twitterTitle')
  } else if (type === 'Airbnb') {
    foregroundImgSrc = '/images/identity/airbnb-icon-light.svg'
    title = fbt('Verify your Airbnb Profile', 'RewardActions.airbnbTitle')
  } else if (type === 'Facebook') {
    foregroundImgSrc = '/images/identity/facebook-icon-light.svg'
    title = fbt('Verify your Facebook Profile', 'RewardActions.facebookTitle')
  } else if (type === 'Google') {
    foregroundImgSrc = '/images/identity/google-icon.svg'
    title = fbt('Verify your Google Profile', 'RewardActions.googleTitle')
  } else if (type === 'ListingCreated') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Create a Listing', 'RewardActions.listingCreatedTitle')
    buttonLink = '/create'
  } else if (type === 'ListingPurchased') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Purchase a Listing', 'RewardActions.listingPurchasedTitle')
    buttonLink = '/'
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
  } else if (type === 'ListingSold') {
    foregroundImgSrc = '/images/growth/sell-icon.svg'
    title = fbt('Sell a Listing', 'RewardActions.listingSoldTitle')
    buttonLink = '/create'
  } else if (type === 'Referral') {
    foregroundImgSrc = '/images/growth/invite-icon.svg'
    title = fbt('Invite Friends to Join Origin', 'RewardActions.referralTitle')
    buttonOnClick = () => {
      window.scrollTo(0, 0)
      props.handleNavigationChange('Invite')
    }
    buttonLink = null
  }

  //TODO: hover button
  // hover color of the button: #111d28
  const renderReward = amount => {
    return (
      <div className="reward d-flex align-items-left pl-2 justify-content-start align-items-center flex-grow-1">
        <img src="images/ogn-icon.svg" />
        <div className="value">{formatTokens(amount)}</div>
      </div>
    )
  }

  let showPossibleRewardAmount = !actionCompleted && reward !== null
  const isInteractable = !actionCompleted && !actionLocked
  const showUnlockModalOnClick =
    actionLocked && isMobile && unlockConditions.length > 0

  let showReferralPending,
    showReferralEarned = false
  // with Invite Friends reward show how much of a reward a
  // user can earn only if pending and earned are both 0
  if (type === 'Referral') {
    showReferralEarned = rewardEarned !== null && rewardEarned.amount !== '0'
    showReferralPending = rewardPending !== null && rewardPending.amount !== '0'

    // when on mobile layout show only 1 reward type at a time
    showReferralPending = isMobile
      ? showReferralPending && !showReferralEarned
      : showReferralPending

    showPossibleRewardAmount = !showReferralPending && !showReferralEarned
  }

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
          <div>
            {buttonLink && (
              <Link
                to={buttonLink}
                className="mt-auto mb-auto"
                onClick={() => buttonOnClick()}
              >
                {actionComponent}
              </Link>
            )}
            {!buttonLink && (
              <div className="mt-auto mb-auto" onClick={() => buttonOnClick()}>
                {actionComponent}
              </div>
            )}
          </div>
        )}
        {!isInteractable && !showUnlockModalOnClick && actionComponent}
        {showUnlockModalOnClick && (
          <div
            className="mt-auto mb-auto"
            onClick={() => onMobileLockClick(unlockConditionText)}
          >
            {actionComponent}
          </div>
        )}
      </Fragment>
    )
  }

  return wrapIntoInteraction(
    <div
      className={`action${isInteractable ? ' active' : ''}${
        isMobile ? ' mobile' : ''
      }`}
    >
      <div className="d-flex action-main">
        <div className="col-1 pr-0 pl-0 d-flex justify-content-center align-items-center">
          {type === 'ListingIdPurchased' ? (
            <img className={type.toLowerCase()} src={foregroundImgSrc} />
          ) : (
            <div className="icon-holder">
              <img className="background" src={backgroundImgSrc} />
              <img className={type.toLowerCase()} src={foregroundImgSrc} />
            </div>
          )}
        </div>
        <div
          className={`d-flex flex-column justify-content-center col-5 col-md-6`}
        >
          <div className="title">{title}</div>
          {actionLocked && !isMobile && unlockConditions.length > 0 && (
            <Fragment>
              <div className="requirement pr-2 d-flex align-items-center ">
                {unlockConditionText}
              </div>
            </Fragment>
          )}
        </div>
        <div className="pl-0 pl-md-3 col-6 col-md-5 d-flex align-items-center justify-content-between">
          <a
            href="#"
            className={`toggle-details${
              detailsKey ? '' : ' invisible'
            } mr-1 mr-md-3`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              toggleDetails(!detailsToggled)
            }}
          >
            {detailsToggled ? (
              isMobile ? (
                <fbt desc="RewardActions.less">Less</fbt>
              ) : (
                <fbt desc="RewardActions.lessDetails">Less Details</fbt>
              )
            ) : isMobile ? (
              <fbt desc="RewardActions.more">More</fbt>
            ) : (
              <fbt desc="RewardActions.moreDetails">More Details</fbt>
            )}
          </a>
          {showReferralPending && (
            <div className="d-flex flex-column flex-grow-1">
              {renderReward(rewardPending.amount)}
              <div className="sub-text ml-2">
                <fbt desc="RewardActions.pending">Pending</fbt>
              </div>
            </div>
          )}
          {showReferralEarned && (
            <div className="d-flex flex-column flex-grow-1">
              {renderReward(rewardEarned.amount)}
              <div className="d-center sub-text ml-2">
                <fbt desc="RewardActions.earned">Earned</fbt>
              </div>
            </div>
          )}
          {actionCompleted &&
            rewardEarned !== null &&
            rewardEarned.amount !== '0' && (
              <div className="d-flex flex-column flex-grow-1">
                {renderReward(rewardEarned.amount)}
                <div className="d-center sub-text ml-2">
                  <fbt desc="RewardActions.earned">Earned</fbt>
                </div>
              </div>
            )}
          {showPossibleRewardAmount && renderReward(reward.amount)}
          {!actionCompleted && !actionLocked && (
            <div className="btn btn-primary mt-2 mb-2">
              <img className="button-caret" src="images/caret-white.svg" />
            </div>
          )}
          {actionLocked && (
            <img className="lock" src="images/growth/lock-icon.svg" />
          )}
          {/* Just a padding placeholder*/}
          {actionCompleted && <div className="placeholder" />}
        </div>
      </div>
      {!detailsKey || !detailsToggled ? null : (
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
      min-height: 100px
      border: 1px solid var(--light)
      border-radius: 5px
      margin-top: 20px
      color: var(--dark)
      .action-main
        padding: 20px
      &.active:hover
        background-color: var(--pale-grey-three)
        color: var(--dark)
      .icon-holder
        position: relative
      .background
        width: 60px
      .profile
        position: absolute
        left: 16.5px
        top: 16px
        width: 27px
      .email
        position: absolute
        left: 16px
        top: 22px
        width: 27px
      .phone
        position: absolute
        left: 22px
        top: 17px
        width: 17px
      .facebook
        position: absolute
        left: 21px
        top: 18px
        width: 15px
      .airbnb
        position: absolute
        left: 14px
        top: 16px
        width: 34px
      .twitter
        position: absolute
        left: 16px
        top: 20px
        width: 29px
       .google
        position: absolute
        left: 16px
        top: 16px
        width: 29px
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
      .referral
        position: absolute
        left: 15px
        top: 16px
        width: 29px
      .lock
        width: 2.5rem
      .image-holder
        position: relative
      .title
        font-size: 18px
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
      .reward .value
        padding-bottom: 1px
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
        border-top: 1px solid var(--light)
        background-color: #f7f8f8
        text-align: center
        border-radius: 0 0 5px 5px
        padding: 10px
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
  .growth-campaigns.container.mobile
    .action
      min-height: 80px
      margin-top: 10px
      .action-main
        padding: 17px 0px 17px 20px
      .background
        width: 2.5rem
      .reward .value
        font-size: 0.875rem
      .profile
        left: 10.5px
        top: 12px
        width: 18px
      .email
        left: 10.5px
        top: 15px
        width: 18px
      .phone
        left: 14px
        top: 12px
        width: 11.5px
      .facebook
        left: 14px
        top: 12px
        width: 10px
      .airbnb
        left: 9px
        top: 11px
        width: 22.5px
      .twitter
        left: 9.5px
        top: 13px
        width: 20px
      .google
        left: 10px
        top: 10px
        width: 21px
      .listingsold
        left: 9px
        top: 10px
        width: 24.5px
      .listingpurchased
        left: 0px
        top: 0px
        width: 23px
      .referral
        left: 10px
        top: 11px
        width: 20px
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
      .lock
        width: 1.56rem
      .listingpurchased
        left: 13px
        top: 17px
        width: 35px
      .listingidpurchased
        width: 44px
`)
