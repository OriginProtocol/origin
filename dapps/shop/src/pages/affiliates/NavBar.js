import React from 'react'
import queryString from 'query-string'
import { useLocation } from 'react-router-dom'
import get from 'lodash/get'

import { useStateValue } from 'data/state'
import useAffiliateEarnings from 'utils/useAffiliateEarnings'

import Link from 'components/Link'
import Popover from 'components/Popover'
import TwitterIcon from 'components/icons/Twitter'
import FacebookIcon from 'components/icons/Facebook'
import LinkIcon from 'components/icons/Link'
import OgnIcon from 'components/icons/OGN'

const AffiliateNav = () => {
  const { earnings, loading } = useAffiliateEarnings()
  const [{ affiliate }, dispatch] = useStateValue()
  const location = useLocation()

  if (!affiliate || loading || !affiliate.toolbar) {
    return null
  }

  const q = queryString.parse(location.search)
  const s = queryString.stringify({ ...q, r: get(affiliate, 'account') })
  const url = `${window.location.origin}${window.location.pathname}#${location.pathname}?${s}`

  return (
    <nav className="affiliate-bar">
      <div className="container">
        <div className="affiliates-logo" />
        <div className="d-flex align-items-center share">
          <span className="ml-4 mr-2">Share</span>
          <TextLink url={url} />
          <Tweet url={url} />
          <Facebook url={url} />
        </div>
        <div className="earnings d-none d-lg-flex">
          <span>Pending <OgnIcon /> {earnings.commissionPending}</span>
          <span>Earned <OgnIcon /> {earnings.commissionPaid}</span>
        </div>
        <div className="d-flex">
          <Link to="/affiliates" className="nav-link">
            Dashboard
          </Link>
          <a href="#" onClick={e => {
            e.preventDefault()
            dispatch({ type: 'setAffiliate', affiliate: undefined })
          }} className="nav-link">
            Logout
          </a>
        </div>
      </div>
    </nav>
  )
}

const TextLink = ({ url }) => {
  return (
    <Popover
      button={<LinkIcon />}
      className="btn btn-sm btn-outline-light ml-2"
    >
      <div className="popover-body">
        <div className="font-weight-bold">
          Text link to this Page created below.
        </div>
        <div>Copy the link and paste it into your website.</div>
        <input
          onClick={e => e.target.select()}
          className="form-control my-2"
          defaultValue={url}
        />
      </div>
    </Popover>
  )
}

const Tweet = ({ url }) => (
  <button
    className="btn btn-sm btn-outline-light ml-2 tweet"
    onClick={() => {
      const shareUrl = 'https://twitter.com/intent/tweet'
      const search = {
        via: 'originprotocol',
        text: 'Check this out!',
        url
      }
      window.open(
        `${shareUrl}?${queryString.stringify(search)}`,
        '_blank',
        'width=450,height=250,left=0,top=0'
      )
    }}
  >
    <TwitterIcon />
  </button>
)

const Facebook = ({ url }) => (
  <button
    className="btn btn-sm btn-outline-light ml-2"
    onClick={() => {
      const shareUrl = 'https://www.facebook.com/sharer.php'
      const search = { display: 'popup', u: url }
      window.open(
        `${shareUrl}?${queryString.stringify(search)}`,
        '_blank',
        'width=550,height=500,left=0,top=0'
      )
    }}
  >
    <FacebookIcon />
  </button>
)

export default AffiliateNav

require('react-styl')(`
  .affiliate-bar
    > .container
      display: flex
      justify-content: space-between
      align-items: center
      padding-top: 0.375rem
      padding-bottom: 0.375rem
      > div:nth-child(1)
        flex: 1
      > div:nth-child(2)
        flex: 1
      > div:nth-child(2)
        flex: 4
    background: #000
    border-bottom: 5px solid #0071ff
    font-size: 0.875rem
    color: #fff
    .affiliates-logo
      background-image: url(images/affiliate-logo.svg)
      width: 55px
      height: 22px
      background-repeat: no-repeat
      background-size: contain
    a
      color: #eee
      &:hover,&:active,&:focus
        color: #fff
    .earnings
      display: flex
      margin-right: 1rem
      padding-right: 2rem
      border-right: 1px solid #555555
      > span
        display: flex
        align-items: center
        &:not(:last-child)
          margin-right: 2.5rem
        svg
          margin: 0 0.5rem 0 0.75rem
          width: 1.25rem
    .share
      .btn
        min-width: 4rem
        min-height: 1.75rem
        display: flex
        justify-content: center
        svg
          flex: 1
          max-height: 18px
          fill: #fff
        &:hover svg
          fill: #000

`)
