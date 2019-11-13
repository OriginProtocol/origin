import React from 'react'
import { fbt } from 'fbt-runtime'
import numberFormat from 'utils/numberFormat'
import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

function MobileDownloadAction(props) {
  if (!props.action) return ''

  const { status, reward } = props.action

  const { isMobile, walletType } = props

  if (walletType === 'Origin Wallet' || walletType === 'Mobile') {
    // Don't show on Mobile app
    return null
  }

  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  if (actionCompleted) {
    // Don't show if completed
    return null
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

  const storeBadges = () => {
    return (
      <div className={`d-flex mt-1 ${!isMobile ? 'mr-3' : ''}`}>
        <img
          className="mr-2 download-icon"
          src="images/app-store-button@2x.png"
        />
        <img className="download-icon" src="images/android-button@2x.png" />
      </div>
    )
  }

  return (
    <div
      className={`mobile-rewards-box d-flex ${
        !isMobile ? 'align-items-center' : 'mobile'
      }`}
      onClick={() => {
        window.open('https://www.originprotocol.com/mobile', 'blank')
      }}
    >
      <div className="featured">
        <fbt desc="growth.mobileRewards.featured">FEATURED</fbt>
      </div>
      <div className="phone-holder">
        <img className="phones mr-3" src="images/mobile/devices-layered.png" />
      </div>
      <div className="d-flex flex-column mr-0 mr-md-4">
        <h2>
          <fbt desc="growth.mobileRewards.downloadMarketplaceApp">
            Download the Origin Marketplace app
          </fbt>
        </h2>
        <div className="d-flex">
          <div className="install mt-0 mt-md-2 mb-2 mb-md-0">
            <fbt desc="growth.mobileRewards.installAndComplete">
              Install &amp; complete 3 verifications to earn
            </fbt>
            <img className="ogn-icon-small" src="images/ogn-icon.svg" />
            <span className="ogn-value">{formatTokens(reward.amount)}</span>
          </div>
        </div>
        {isMobile && storeBadges()}
      </div>
      {!isMobile && storeBadges()}
    </div>
  )
}

export default withWallet(withIsMobile(MobileDownloadAction))

require('react-styl')(`
  .mobile-rewards-box
    cursor: pointer
    border-radius: 10px
    background-color: #f3f7f9
    margin-top: 30px
    padding: 20px
    position: relative
    .featured
      position: absolute
      right: 7px
      top: 7px
      color: white
      border-radius: 3px
      background-color: #fec100
      padding-left: 3px
      padding-right: 3px
      font-size: 11px
      font-weight: 900
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
      line-height: 1.4rem
      color: var(--dark)
    .ogn-value
      font-size: 18px
      font-weight: bold
      color: #007fff
    .ogn-icon-small
      width: 20px
      margin-left: 5px
      margin-right: 3px
    .download-icon
      width: 135px
      height: 42px
    &.mobile
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
        line-height: 1rem
      .ogn-value
        font-size: 14px
      .ogn-icon-small
        width: 14px
        margin-left: 5px
        margin-right: 3px
        margin-bottom: 0px
      .download-icon
        width: 96px
        height: 30px
`)
