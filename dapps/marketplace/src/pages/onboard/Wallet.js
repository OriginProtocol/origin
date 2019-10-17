import React, { useState, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'
import Redirect from 'components/Redirect'
import QueryError from 'components/QueryError'
import LoadingSpinner from 'components/LoadingSpinner'

import ListingPreview from './_ListingPreview'
import HelpWallet from './_HelpWallet'
import HelpOriginWallet from 'components/DownloadApp'
import WalletHeader from './_WalletHeader'

import DownloadWalletCTA from './_DownloadWalletCTA'

import query from 'queries/Wallet'

const OnboardWallet = ({ listing, linkPrefix }) => {
  const { error, data, networkStatus } = useQuery(query, {
    notifyOnNetworkStatusChange: true
  })

  const [redirect, setRedirect] = useState(false)

  const wallet = get(data, 'web3.metaMaskAccount.id') ||
    get(data, 'web3.mobileWalletAccount.id')

  useEffect(() => {
    if (wallet) {
      setRedirect(`${linkPrefix}/onboard/email`)
    }
  }, [wallet])

  if (redirect) {
    return <Redirect to={`${linkPrefix}/onboard/email`} />  
  }

  if (networkStatus === 1) {
    return <LoadingSpinner />
  } else if (error) {
    return <QueryError query={query} />
  }

  return (
    <>
      <WalletHeader />
      <div className="row">
        <div className="col-md-7">
          <DownloadWalletCTA />
        </div>
        <div className="col-md-4 offset-md-1">
          <ListingPreview listing={listing} />
          <HelpWallet />
        </div>
      </div>
    </>
  )
}

export default OnboardWallet

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
