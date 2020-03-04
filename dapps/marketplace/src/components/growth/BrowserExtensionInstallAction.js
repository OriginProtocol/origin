import React from 'react'
import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'

function BrowserExtensionInstallAction(props) {
  if (!props.action) return null

  const { status } = props.action

  const { isMobile, isOriginWallet } = props

  if (isOriginWallet) {
    // Don't show on Mobile app
    return null
  }

  const actionCompleted = ['Exhausted', 'Completed'].includes(status)

  if (actionCompleted) {
    // Don't show if completed
    return null
  }

  return (
    <div
      className={`browser-extension-rewards-box d-flex ${
        !isMobile ? 'align-items-center' : 'mobile'
      }`}
      onClick={() => {
        window.open(
          'https://originprotocol.com/reward/extension/march_2020',
          'blank'
        )
      }}
    >
      <img
        className="download-icon"
        src="images/growth/download-extension@2x.png"
      />
    </div>
  )
}

export default withWallet(withIsMobile(BrowserExtensionInstallAction))

require('react-styl')(`
  .browser-extension-rewards-box
    cursor: pointer
    background-color: #f3f7f9
    margin-top: 30px
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
      max-width: 100%
      max-height: 100%
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
        max-width: 100%
        max-height: 100%
`)
