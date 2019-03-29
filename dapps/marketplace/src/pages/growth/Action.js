import React, { Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import { Link } from 'react-router-dom'

const GrowthEnum = require('Growth$FbtEnum')

function Action(props) {
  const {
    type,
    status,
    reward,
    rewardEarned,
    rewardPending,
    unlockConditions
  } = props.action

  const actionLocked = status === 'Inactive'

  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  let backgroundImgSrc = 'images/identity/verification-shape-blue.svg'
  if (actionCompleted) {
    backgroundImgSrc = 'images/identity/verification-shape-green.svg'
  } else if(actionLocked) {
    backgroundImgSrc = 'images/identity/verification-shape-grey.svg'
  }


  const formatTokens = tokenAmount => {
    return web3.utils
      .toBN(tokenAmount)
      .div(props.decimalDivision)
      .toString()
  }

  let foregroundImgSrc
  let title
  let infoText
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
  } else if (type === 'ListingCreated') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Create a Listing', 'RewardActions.listingCreatedTitle')
    buttonLink = '/create'
  } else if (type === 'ListingPurchased') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Purchase a Listing', 'RewardActions.listingPurchasedTitle')
    buttonLink = '/'
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
  const renderReward = (amount) => {
    return (
      <div className="reward d-flex ml-4 align-items-center pl-2">
        <img src="images/ogn-icon.svg" />
        <div className="value">
          {formatTokens(amount)}
        </div>
      </div>
    )
  }

  const renderActionButton = handleOnClick => {
    return (
      <button
        className="btn btn-primary ml-2 mt-2 mb-2"
        onClick={handleOnClick}
      >
      <img className="button-caret" src="images/caret-white.svg" />
      </button>
    )
  }

  let showPossibleRewardAmount = !actionCompleted && reward !== null

  // with Invite Friends reward show how much of a reward a
  // user can earn only if pending and earned are both 0
  if (type === 'Referral') {
    showPossibleRewardAmount =
      (rewardPending === null || rewardPending.amount === '0') &&
      (rewardEarned === null || rewardEarned.amount === '0')
  }

  return (
    <div className="d-flex action">
      <div className="col-1 pr-0 pl-0 d-flex justify-content-center">
        <div className="image-holder mt-auto mb-auto">
          {
            <Fragment>
              <img className="background" src={backgroundImgSrc} />
              <img className={type.toLowerCase()} src={foregroundImgSrc} />
            </Fragment>
          }
        </div>
      </div>
      <div
        className={`d-flex flex-column justify-content-center col-6`}
      >
        <div className="title">{title}</div>
        {actionLocked && unlockConditions.length > 0 && (
          <Fragment>
            <div className="requirement pr-2 d-flex align-items-center ">
              <fbt desc="RewardActions.requires">Requires:</fbt>{' '}
              {unlockConditions.map(unlockCondition => {
                return (
                  GrowthEnum[unlockCondition.messageKey] ? (
                    <fbt desc="growth">
                      <fbt:enum
                        enum-range={GrowthEnum}
                        value={unlockCondition.messageKey}
                      />
                    </fbt>
                  ) : (
                    'Missing translation'
                  )
                )
              })
              .join(', ')
            }
            </div>
          </Fragment>
        )}
      </div>
      <div className="col-5 d-flex align-items-center justify-content-end">
        {type === 'Referral' &&
          rewardPending !== null &&
          rewardPending.amount !== '0' && (
            <div className="d-flex flex-column">
              {renderReward(rewardPending.amount)}
              <div className="sub-text ml-4">
                <fbt desc="RewardActions.pending">Pending</fbt>
              </div>
            </div>
          )}
        {type === 'Referral' &&
          rewardEarned !== null &&
          rewardEarned.amount !== '0' && (
            <div className="d-flex flex-column">
              {renderReward(rewardEarned.amount)}
              <div className="d-center sub-text ml-4">
                <fbt desc="RewardActions.earned">Earned</fbt>
              </div>
            </div>
          )}
        {actionCompleted &&
          rewardEarned !== null &&
          rewardEarned.amount !== '0' && (
            <div className="d-flex flex-column">
              {renderReward(rewardEarned.amount)}
              <div className="d-center sub-text ml-4">
                <fbt desc="RewardActions.earned">Earned</fbt>
              </div>
            </div>
          )}
        {showPossibleRewardAmount && renderReward(reward.amount)}
        {!actionCompleted && !actionLocked && (
          <div className="ml-3">
            {buttonLink && (
              <Link to={buttonLink} className="mt-auto mb-auto">
                {renderActionButton(buttonOnClick)}
              </Link>
            )}
            {!buttonLink && (
              <div className="mt-auto mb-auto">
                {renderActionButton(buttonOnClick)}
              </div>
            )}
          </div>
        )}
        {actionLocked && (
          <div className="ml-3">
            <img className="lock ml-2" src="images/growth/lock-icon.svg" />
          </div>
        )}
        {/* Just a padding placeholder*/}
        {actionCompleted && (
          <div className="ml-3">
            <div className="placeholder ml-2"/>
          </div>
        )}
      </div>
    </div>
  )
}

export default Action

require('react-styl')(`
  .growth-campaigns.container
    .action
      height: 100px
      border: 1px solid var(--light)
      border-radius: 5px
      margin-top: 20px
      padding: 20px
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
      .referral
        position: absolute
        left: 15px
        top: 16px
        width: 29px
      .lock
        width: 40px
      .image-holder
        position: relative
      .title
        font-size: 18px
        font-weight: bold
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
        text-align: center
        font-weight: normal
        color: var(--dusk)
      .reward img
        margin-right: 6px
        width: 20px
      .requirement
        color: var(--dusk)
        font-size: 14px
        font-weight: normal
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
`)
