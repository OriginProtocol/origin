import React from 'react'
import { fbt } from 'fbt-runtime'
import numberFormat from 'utils/numberFormat'

const appStoreLink =
  'https://itunes.apple.com/us/app/origin-marketplace/id1446091928'
const playStoreLink =
  'https://play.google.com/store/apps/details?id=com.origincatcher'

function MobileDownloadAction(props) {
  if (!props.action) return ''

  const { status, reward, rewardEarned } = props.action

  const { isMobile } = props

  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

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

  const storeLinks = () => {
    if (actionCompleted) return ''

    return (
      <div className={`d-flex mt-1 ${!isMobile ? 'mr-3' : ''}`}>
        <a className="mr-2" href={appStoreLink}>
          <img className="download-icon" src="images/app-store-button@2x.png" />
        </a>
        <a href={playStoreLink}>
          <img className="download-icon" src="images/android-button@2x.png" />
        </a>
      </div>
    )
  }

  return (
    <div
      className={`mobile-rewards-box d-flex ${
        !isMobile ? 'align-items-center' : 'mobile'
      }`}
    >
      <div className="phone-holder">
        <img
          className={`phones mr-3 ${actionCompleted ? 'small' : ''}`}
          src="images/mobile/devices-layered.png"
        />
        {actionCompleted && (
          <img className="green-tick" src="images/growth/green-tick-icon.svg" />
        )}
      </div>
      <div className="d-flex flex-column mr-0 mr-md-4">
        <h2>
          {!actionCompleted && (
            <fbt desc="growth.mobileRewards.downloadMarketplaceApp">
              Download the Origin Marketplace app
            </fbt>
          )}
          {actionCompleted && (
            <fbt desc="growth.mobileRewards.marketplaceInstalled">
              Origin Marketplace installed
            </fbt>
          )}
        </h2>
        <div className="d-flex">
          <div className="install">
            {!actionCompleted && (
              <fbt desc="growth.mobileRewards.installAndEarn">
                Install and earn
              </fbt>
            )}
            {actionCompleted && (
              <fbt desc="growth.mobileRewards.earned">Earned</fbt>
            )}
          </div>
          <img className="ogn-icon-small" src="images/ogn-icon.svg" />
          <div className="ogn-value">
            {actionCompleted && formatTokens(rewardEarned.amount)}
            {!actionCompleted && formatTokens(reward.amount)}
          </div>
        </div>
        {isMobile && storeLinks()}
      </div>
      {!isMobile && storeLinks()}
    </div>
  )
}

export default MobileDownloadAction

require('react-styl')(`
  .mobile-rewards-box
    border-radius: 10px
    background-color: #f3f7f9
    margin-top: 30px
    padding: 20px
    .phone-holder
      position: relative
    .green-tick
      position: absolute
      width: 20px
      bottom: -6px
      left: 30px
    .phones
      height: 90px
    .phones.small
      height: 63px
    h2
      font-family: Lato    
      font-size: 24px
      font-weight: bold
      line-height: 1.17
      color: #0d1d29
      margin-bottom: 2px
    .install
      font-size: 18px
      font-weight: normal
      line-height: 1.93
      color: var(--dark)
    .ogn-value
      font-size: 18px
      font-weight: bold
      line-height: 1.93
      color: #007fff
    .ogn-icon-small
      width: 20px
      margin-left: 5px
      margin-right: 3px
      margin-bottom: -3px
    .download-icon
      width: 135px
  .mobile-rewards-box.mobile
    .phones
      height: 117px
    .phones.small
      height: 55px
    .green-tick
      position: absolute
      width: 20px
      bottom: -6px
      left: 25px
    h2  
      font-size: 18px
    .install
      font-size: 14px
    .ogn-value
      font-size: 14px
    .ogn-icon-small
      width: 14px
    .download-icon
      width: 96px
`)
