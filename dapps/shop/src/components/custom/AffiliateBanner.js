import React from 'react'
import { useHistory } from 'react-router-dom'

import Link from 'components/Link'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

const AffiliateBanner = () => {
  const { config } = useConfig()
  const history = useHistory()
  const [{ affiliate }] = useStateValue()

  if (!config.affiliates || affiliate) {
    return null
  }

  return (
    <div
      className="affiliate-banner"
      onClick={() => history.push('/affiliates')}
    >
      <div className="logo" />
      <div className="earn">
        Earn Origin Tokens (OGN) by referring customers
      </div>
      <Link
        to="/affiliates"
        className="btn btn-dark"
        onClick={e => e.preventDefault()}
      >
        Learn more
      </Link>
    </div>
  )
}

export default AffiliateBanner

require('react-styl')(`
  .affiliate-banner
    cursor: pointer
    line-height: 1.25rem
    margin-top: -1rem
    margin-bottom: 2rem
    align-items: start
    background: #1a82ff
    min-height: 4rem
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2.75rem 2rem
    background-image: url(images/affiliate-bnr-sm.svg)
    background-repeat: no-repeat
    background-size: cover
    background-position: bottom right
    color: #fff;
    .earn
      margin: 0 0.5rem
      flex: 1
      text-align: center
    .btn
      padding-left: 2rem
      padding-right: 2rem
      white-space: nowrap
    .logo
      background-image: url(images/origin-affiliates.svg)
      background-repeat: no-repeat
      background-size: contain
      height: 2rem
      width: 6rem
  @media (min-width: 767.98px)
    .affiliate-banner
      height: 2.25rem
  @media (max-width: 767.98px)
    .affiliate-banner
      .earn
        display: none
      margin-top: -2rem
      margin-bottom: 1rem

`)
