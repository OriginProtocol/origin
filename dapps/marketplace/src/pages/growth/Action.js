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
  const backgroundImgSrc = actionCompleted
    ? 'images/identity/verification-shape-green.svg'
    : 'images/identity/verification-shape-blue.svg'

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
    infoText = fbt('Confirm your email address in Attestations.', 'RewardActions.emailExplanation')
  } else if (type === 'Profile') {
    foregroundImgSrc = '/images/growth/profile-icon.svg'
    title = fbt('Verify your Origin Profile', 'RewardActions.profileTitle')
    infoText = fbt('Connect your Origin Profile in Attestations.', 'RewardActions.profileExplanation')
  } else if (type === 'Phone') {
    foregroundImgSrc = '/images/identity/phone-icon-light.svg'
    title = fbt('Verify your Phone Number', 'RewardActions.phoneTitle')
    infoText = fbt('Confirm your phone number in Attestations.', 'RewardActions.phoneExplanation')
  } else if (type === 'Twitter') {
    foregroundImgSrc = '/images/identity/twitter-icon-light.svg'
    title = fbt('Connect your Twitter Profile', 'RewardActions.twitterTitle')
    infoText = fbt('Connect your Twitter Profile in Attestationts.', 'RewardActions.twitterExplanation')
  } else if (type === 'Airbnb') {
    foregroundImgSrc = '/images/identity/airbnb-icon-light.svg'
    title = fbt('Connect your Airbnb Profile', 'RewardActions.airbnbTitle')
    infoText = fbt('Connect your Airbnb Profile in Attestations.', 'RewardActions.airbnbExplanation')
  } else if (type === 'Facebook') {
    foregroundImgSrc = '/images/identity/facebook-icon-light.svg'
    title = fbt('Connect your Facebook Profile', 'RewardActions.facebookTitle')
    infoText = fbt('Connect your Facebook Profile in Attestations.', 'RewardActions.facebookExplanation')
  } else if (type === 'ListingCreated') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Create a Listing', 'RewardActions.listingCreatedTitle')
    infoText = fbt('Successfully complete the purchase of any one listing.', 'RewardActions.listingCreatedExplanation')
    buttonLink = '/create'
  } else if (type === 'ListingPurchased') {
    foregroundImgSrc = '/images/growth/purchase-icon.svg'
    title = fbt('Purchase a Listing', 'RewardActions.listingPurchasedTitle')
    infoText = fbt('Successfully complete the sale of any one listing.', 'RewardActions.listingPurchasedExplanation')
    buttonLink = '/'
  } else if (type === 'ListingSold') {
    foregroundImgSrc = '/images/growth/sell-icon.svg'
    title = fbt('Sell a Listing', 'RewardActions.listingSoldTitle')
    infoText = fbt('Sell a listing on marketplace', 'RewardActions.listingSoldExplanation')
    buttonLink = '/create'
  } else if (type === 'Referral') {
    title = fbt('Invite Friends', 'RewardActions.referralTitle')
    infoText = fbt('Get your friends to join Origin with active accounts.', 'RewardActions.referralExplanation')
    buttonOnClick = () => {
      window.scrollTo(0, 0)
      props.handleNavigationChange('Invite')
    }
    buttonLink = null
  }

  //TODO: hover button
  // hover color of the button: #111d28
  const renderReward = (amount, renderPlusSign) => {
    return (
      <div className="reward d-flex mr-4 align-items-center pl-2 pt-2 pb-2 mt-2">
        <img src="images/ogn-icon.svg" />
        <div className="value">
          {renderPlusSign ? '+' : ''}
          {formatTokens(amount)}
        </div>
      </div>
    )
  }

  const renderActionButton = handleOnClick => {
    return (
      <button
        className="btn btn-primary btn-rounded mr-2"
        children="Go"
        onClick={handleOnClick}
      />
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
      <div className="col-2 d-flex justify-content-center">
        <div className="image-holder mt-auto mb-auto">
          {type !== 'Referral' && (
            <Fragment>
              <img className="background" src={backgroundImgSrc} />
              <img className={type.toLowerCase()} src={foregroundImgSrc} />
            </Fragment>
          )}
          {type === 'Referral' && (
            <img className="astronaut" src="images/growth/astronaut-icon.svg" />
          )}
          {actionLocked && (
            <img className="lock" src="images/growth/lock-icon.svg" />
          )}
        </div>
      </div>
      <div
        className={`d-flex flex-column ${actionLocked ? 'col-10' : 'col-8'}`}
      >
        <div className="title">{title}</div>
        <div className="info-text">{infoText}</div>
        <div className="d-flex">
          {type === 'Referral' &&
            rewardPending !== null &&
            rewardPending.amount !== '0' && (
              <Fragment>
                <div className="d-flex align-items-center sub-text">
                  <fbt desc="RewardActions.pending">
                    Pending
                  </fbt>
                </div>
                {renderReward(rewardPending.amount, true)}
              </Fragment>
            )}
          {type === 'Referral' &&
            rewardEarned !== null &&
            rewardEarned.amount !== '0' && (
              <Fragment>
                <div className="d-flex align-items-center sub-text">
                  <fbt desc="RewardActions.earned">
                    Earned
                  </fbt>
                </div>
                {renderReward(rewardEarned.amount, true)}
              </Fragment>
            )}
          {actionCompleted &&
            rewardEarned !== null &&
            rewardEarned.amount !== '0' && (
              <Fragment>
                <div className="d-flex align-items-center sub-text">
                  <fbt desc="RewardActions.earned">
                    Earned
                  </fbt>
                </div>
                {renderReward(rewardEarned.amount, false)}
              </Fragment>
            )}
          {showPossibleRewardAmount && renderReward(reward.amount, true)}
          {actionLocked && unlockConditions.length > 0 && (
            <Fragment>
              <div className="emphasis pr-2 pt-1 d-flex align-items-center ">
                Requires
              </div>
              {unlockConditions.map(unlockCondition => {
                return (
                  <div
                    className="requirement d-flex align-items-center pl-2 pt-2 pb-2 mt-2"
                    key={unlockCondition.messageKey}
                  >
                    <img src={unlockCondition.iconSource} />
                    <div className="value">
                      {GrowthEnum[unlockCondition.messageKey] ? (
                        <fbt desc="growth">
                          <fbt:enum
                            enum-range={GrowthEnum}
                            value={unlockCondition.messageKey}
                          />
                        </fbt>
                      ) : (
                        'Missing translation'
                      )}
                    </div>
                  </div>
                )
              })}
            </Fragment>
          )}
        </div>
      </div>
      <div className={`d-flex ${actionLocked ? '' : 'col-2'}`}>
        {!actionCompleted && !actionLocked && (
          <Fragment>
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
          </Fragment>
        )}
      </div>
    </div>
  )
}

export default Action

require('react-styl')(`
  .growth-campaigns.container
    .action
      height: 140px
      border: 1px solid var(--light)
      border-radius: 5px
      margin-top: 20px
      padding: 20px
      .background
        width: 72px
      .profile
        position: absolute
        left: 19px
        top: 18px
        width: 35px
      .email
        position: absolute
        left: 20px
        top: 27px
        width: 30px
      .phone
        position: absolute
        left: 25px
        top: 20px
        width: 22px
      .facebook
        position: absolute
        left: 24px
        top: 18px
        width: 21px
      .airbnb
        position: absolute
        left: 15px
        top: 19px
        width: 44px
      .twitter
        position: absolute
        left: 17px
        top: 22px
        width: 39px
      .listingsold
        position: absolute
        left: 15px
        top: 20px
        width: 45px
      .listingpurchased
        position: absolute
        left: 17px
        top: 21px
        width: 40px
      .lock
        position: absolute
        right: -12px
        bottom: 0px
        width: 30px
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
        background-color: var(--pale-grey)
        border-radius: 52px
        font-size: 14px
        font-weight: bold
        color: var(--clear-blue)
      .reward .value
        padding-bottom: 1px
      .sub-text
        font-size: 14px
        font-weight: bold
        padding-top: 5px
        margin-right: 6px
      .reward img
        margin-right: 6px
      .requirement
        padding-right: 10px
        margin-right: 10px
        height: 28px
        background-color: var(--pale-grey)
        border-radius: 52px
        font-size: 14px
        font-weight: bold
        color: var(--clear-blue)
      .requirement .value
        padding-bottom: 1px
        font-size: 14px
        font-weight: bold
      .requirement img
        margin-right: 6px
      .emphasis
        font-size: 14px
        font-weight: bold
      img
        width: 19px
      .astronaut
        width: 77px
        margin-top: -10px
        margin-left: -15px
`)
