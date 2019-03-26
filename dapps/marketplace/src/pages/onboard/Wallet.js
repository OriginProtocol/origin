import React from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import QueryError from 'components/QueryError'
import Steps from 'components/Steps'
import LinkMobileWallet from 'components/LinkMobileWallet'

import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'

import query from 'queries/Wallet'

const isFirefox = typeof InstallTrigger !== 'undefined'
const isChrome =
  !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime)

const OriginWallet = () => (
  <div className="connect mobile-wallet">
    <div className="top">
      <div className="image" />
      <div>
        <h4>
          <fbt desc="onboard.Wallet.originMobile">Origin Mobile Wallet</fbt>
        </h4>
        <div className="description">
          <fbt desc="onboard.Wallet.description">
            Origin’s Mobile Wallet will allow you to store crypto currency so you
            can buy and sell on our DApp.
          </fbt>
        </div>
        <div className="note">
          <fbt desc="onboard.Wallet.availability">
            Available for iOS and Android
          </fbt>
        </div>
      </div>
    </div>
    <LinkMobileWallet className="btn btn-outline-primary">
      <fbt desc="onboard.Wallet.connect">
        Connect Origin Wallet
      </fbt>
    </LinkMobileWallet>
  </div>
)

const MetaMask = ({ linkPrefix }) => (
  <div className="connect metamask">
    <div className="top">
      <div className="image" />
      <div>
        <h4>MetaMask</h4>
        <div className="description">
          <fbt desc="onboard.Wallet.metamaskDescription">
            MetaMask is a browser extension that will allow you to access the
            decentralized web.
          </fbt>
        </div>
        <div className="note">
          <fbt desc="onboard.Wallet.metamaskAvailable">
            Available for
            <fbt:param name="browser">{isFirefox ? ' Firefox' : ' Google Chrome'}</fbt:param>
          </fbt>
        </div>
      </div>
    </div>
    <Link
      to={`${linkPrefix}/onboard/metamask`}
      className="btn btn-outline-primary"
    >
      <fbt desc="onboard.Wallet.connectMetaMask">
        Connect MetaMask
      </fbt>
    </Link>
  </div>
)

const Step1 = ({ listing, showoriginwallet, linkPrefix }) => {
  const showMetaMask = isChrome || isFirefox

  return (
    <>
      <div className="step">Step 1</div>
      <h3><fbt desc="onboard.Wallet.connectCryptoWallet">Connect a Crypto Wallet</fbt></h3>
      <div className="row">
        <div className="col-md-8">
          <Steps steps={4} step={1} />
          <Query query={query} notifyOnNetworkStatusChange={true}>
            {({ error, data, networkStatus }) => {
              if (networkStatus === 1) {
                return <div><fbt desc="onboard.Wallet.loading">Loading...</fbt></div>
              } else if (error) {
                return <QueryError query={query} />
              }
              if (
                get(data, 'web3.metaMask.id') ||
                get(data, 'web3.mobileWalletAccount.id')
              ) {
                return <Redirect to={`${linkPrefix}/onboard/messaging`} />
              }

              return (
                <>
                  {!showoriginwallet ? null : <OriginWallet />}
                  {!showMetaMask ? null : <MetaMask linkPrefix={linkPrefix} />}
                </>
              )
            }}
          </Query>
        </div>
        <div className="col-md-4">
          <ListingPreview listing={listing} />
          <HelpWallet />
        </div>
      </div>
    </>
  )
}

export default Step1

require('react-styl')(`
  .onboard .connect
    border: 1px solid var(--light)
    border-radius: var(--default-radius)
    padding: 2rem
    margin-bottom: 1.5rem
    display: flex
    flex-direction: column
    .top
      display: flex
      width: 100%
    .image
      margin-right: 2rem
      &::before
        content: ""
        display: block
        width: 105px
        height: 105px
    &.mobile-wallet .image::before
      background: url(images/origin-icon-white.svg) no-repeat center
      background-size: 60%
      background-color: var(--clear-blue)
      border-radius: 18px
    &.metamask .image::before
      background: url(images/metamask.svg) no-repeat center
      background-size: 100%
    h4
      font-family: var(--heading-font)
      font-size: 24px
      font-weight: 300
    .note
      margin: 0.5rem 0 1.5rem
      font-style: italic
    .btn
      padding: 0.75rem 2rem
      border-radius: 2rem
      margin: 0 auto

  @media (max-width: 767.98px)
    .onboard .connect
      padding: 1.5rem
      font-size: 14px
      .image
        margin-right: 1.5rem
        &::before
          width: 5rem
          height: 5rem
      h4
        font-size: 20px

`)
