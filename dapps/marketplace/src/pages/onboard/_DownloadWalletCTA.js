import React from 'react'

import { fbt } from 'fbt-runtime'

import withIsMobile from 'hoc/withIsMobile'

const ThirdpartyWalletLogo = ({ link, className, children }) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer">
      <div className={`thirdparty-wallet${className ? ' ' + className : ''}`}>
        <div className="thirdparty-wallet-name">{children}</div>
      </div>
    </a>
  )
}

const DownloadWalletCTA = ({ isMobile }) => {
  return (
    <div className="download-wallet-cta">
      <div className="origin-app-banner">
        <div className="recommended-tag">
          <fbt desc="DownloadWallet.Recommended">Recommended</fbt>
        </div>
        <div className="content-container">
          <h1>
            <fbt desc="DownloadWallet.OriginMarketplac">Origin Marketplace</fbt>
          </h1>
          <div className="desc">
            <fbt desc="DownloadWallet.description">
              The easiest way to buy and sell with our marketplace and crypto
              wallet in one app
            </fbt>
          </div>
          <img src="/images/onboard/origin-marketplace.png" />
          <div className="actions">
            <a
              href="https://itunes.apple.com/app/origin-wallet/id1446091928"
              className="ios-link"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
            <a
              href="https://play.google.com/store/apps/details?id=com.origincatcher"
              className="android-link"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
          </div>
        </div>
      </div>
      <div className="thirdparty-wallets">
        {isMobile ? (
          <>
            <ThirdpartyWalletLogo link="https://token.im/" className="imtoken">
              imToken
            </ThirdpartyWalletLogo>
            <ThirdpartyWalletLogo
              link="https://wallet.coinbase.com/"
              className="coinbase"
            >
              Coinbase Wallet
            </ThirdpartyWalletLogo>
            <ThirdpartyWalletLogo
              link="https://metamask.io/"
              className="metamask"
            >
              MetaMask
            </ThirdpartyWalletLogo>
            <ThirdpartyWalletLogo
              link="https://trustwallet.com/"
              className="trust"
            >
              Trust Wallet
            </ThirdpartyWalletLogo>
          </>
        ) : (
          <>
            <ThirdpartyWalletLogo
              link="https://metamask.io/"
              className="metamask"
            >
              MetaMask
            </ThirdpartyWalletLogo>
            <ThirdpartyWalletLogo
              link="https://www.meetdapper.com/"
              className="dapper"
            >
              Dapper
            </ThirdpartyWalletLogo>
          </>
        )}
      </div>
    </div>
  )
}

export default withIsMobile(DownloadWalletCTA)

require('react-styl')(`
  .download-wallet-cta
    margin-bottom: 2rem
    .origin-app-banner
      position: relative
      padding: 4.125rem
      border-radius: 5px
      background-color: #007fff
      margin-bottom: 1.25rem
      color: #fff
      overflow: hidden
      text-align: center
      .content-container
        max-width: 350px
        margin: 0 auto
      h1
        font-size: 1.5rem
        margin-bottom: 1.25rem
      .desc
        margin-bottom: 1.75rem
        line-height: 1.2
        padding: 0 0.75rem
      .recommended-tag
        background-color: #0d1d29
        position: absolute
        top: 0
        right: 0
        width: 250px
        font-size: 0.75rem
        text-transform: uppercase
        font-weight: bold
        transform: rotate(45deg) translateX(30%) translateY(-100%)
        padding: 0.5rem
      img
        max-width: 100%
      .actions
        display: flex
        flex-direction: row
        justify-content: space-around
        a
          display: inline-block
          height: 3rem
          width: 100%
          background-repeat: no-repeat
          background-position: center
          background-size: contain
          &.ios-link
            background-image: url('/images/onboard/app-store-button.svg')
          &.android-link
            background-image: url('/images/onboard/google-play-button.svg')
    .thirdparty-wallets
      display: grid
      grid-template-columns: calc(50% - 0.5rem) calc(50% - 0.5rem)
      grid-row-gap: 1rem
      grid-column-gap: 1rem
      .thirdparty-wallet
        display: flex
        border-radius: 5px
        border: solid 1px #c2cbd3
        padding: 2rem 3rem
        .thirdparty-wallet-name
          color: var(--dark)
          justify-content: center
          display: flex
          flex-direction: column
          line-height: 1.3rem
        &:before
          content: ''
          display: inline-block
          background-image: url('/images/onboard/wallets/metamask-icon.svg')
          height: 2.5rem
          width: 2.5rem
          background-size: contain
          background-repeat: no-repeat
          background-position: center
          margin-right: 1rem
        &.dapper:before
          background-image: url('/images/onboard/wallets/dapper.png')
        &.imtoken:before
          background-image: url('/images/onboard/wallets/imtoken.png')
        &.trust:before
          background-image: url('/images/onboard/wallets/trustwallet.png')
        &.coinbase:before
          background-image: url('/images/onboard/wallets/coinbasewallet.png')
  @media (max-width: 767.98px)
    .download-wallet-cta
      .origin-app-banner
        padding: 1.5rem
        h1
          margin-top: 1rem
        .recommended-tag
          font-size: 0.625rem
          transform: rotate(45deg) translateX(30%) translateY(-150%)
          padding: 0.375rem
        .actions
          a
            height: 2.5rem
      .thirdparty-wallets
        .wallet
          padding: 1rem
`)
