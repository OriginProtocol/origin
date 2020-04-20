import React, { useState, useEffect } from 'react'

import { useStateValue } from 'data/state'

import Link from 'components/Link'
import Toggle from 'components/Toggle'
import Tooltip from 'components/Tooltip'
import OgnIcon from 'components/icons/OGN'
import useAffiliateEarnings from 'utils/useAffiliateEarnings'

import Landing from './Landing'

const Affiliates = () => {
  const [{ affiliate }, dispatch] = useStateValue()
  const [state, setStateRaw] = useState({
    mode: affiliate ? 'affiliate' : 'default'
  })
  const setState = newState => setStateRaw({ ...state, ...newState })
  const { mode, account } = state

  const props = { setState, state, affiliate, dispatch, account }

  if (mode === 'affiliate') {
    return <Affiliate {...props} />
  }

  return <Landing {...props} />
}

const Affiliate = ({ setState, dispatch, affiliate }) => {
  const { earnings, loading } = useAffiliateEarnings()

  useEffect(() => {
    if (!affiliate) {
      setState({ mode: 'default' })
    }
  }, [affiliate])

  if (!affiliate) {
    return null
  }

  return (
    <div className="affiliates-page">
      <div className="collection">
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>Affiliate Dashboard</span>
        </div>
      </div>

      <h5>Affiliate Dashboard</h5>
      <div className="description">
        After you&apos;ve enabled your Affiliate toolbar below, you can go to
        any page on this site and copy the URL, or click any of the “share”
        buttons you see, and your Affiliate code will be embedded.
        <div className="mt-2">
          You will only earn OGN for purchase made through your Affiliate links
        </div>
      </div>
      {loading ? (
        'Loading'
      ) : (
        <div className="stats">
          <div>
            <div>Pending orders</div>
            <div>{earnings.pendingOrders}</div>
          </div>
          <div>
            <div>Completed orders</div>
            <div>{earnings.completedOrders}</div>
          </div>
          <div>
            <div>Pending OGN</div>
            <div>
              <OgnIcon />
              {earnings.commissionPending}
            </div>
          </div>
          <div>
            <div>Paid OGN</div>
            <div>
              <OgnIcon />
              {earnings.commissionPaid}
            </div>
          </div>
        </div>
      )}
      <div className="status">
        <div>Affiliate account status</div>
        <div>
          <span className="active" />
          Active
        </div>
        <div>Web3 wallet address</div>
        <div>{affiliate.account}</div>
        <div>View Affiliate toolbar</div>
        <div className="d-flex align-items-center">
          <Toggle
            value={affiliate.toolbar}
            onChange={toolbar =>
              dispatch({
                type: 'setAffiliate',
                affiliate: { ...affiliate, toolbar }
              })
            }
          />
          <Tooltip text="Use this toolbar to easily share your Affiliate links and for a summary of your OGN earnings">
            <img className="ml-3" src="images/info-icon.svg" />
          </Tooltip>
        </div>
      </div>
      <div className="mt-3">
        <button
          onClick={() => {
            dispatch({ type: 'setAffiliate', affiliate: undefined })
            setState({ mode: 'default', modal: false })
          }}
          className="btn btn-link"
        >
          Logout of Origin Affiliates
        </button>
      </div>
    </div>
  )
}

export default Affiliates

require('react-styl')(`
  .affiliates-page
    h5
      font-size: 1.25rem
      font-weight: bold
      margin-bottom: 1rem
    .btn-link
      color: #007dff
      text-decoration: underline
      padding: 0
    .description
      font-size: 0.875rem
    .status
      display: grid
      grid-column-gap: 1rem
      grid-row-gap: 1rem
      grid-template-columns: 12rem 1fr
      font-size: 1.125rem
      word-break: break-word
      .active
        vertical-align: -2px
        margin-right: 0.25rem
        background: #00d716
        display: inline-block
        border-radius: 1rem
        width: 1rem
        height: 1rem
    .stats
      display: flex
      flex-wrap: wrap
      margin: 2rem -0.5rem 1rem -0.5rem
      > div
        display: flex
        flex: 1
        flex-direction: column
        align-items: center
        background-color: #eeeff0
        border-radius: 5px
        padding: 1.5rem 1rem
        margin: 0 0.5rem 1rem 0.5rem
        > div
          text-align: center
        > div:first-child
          font-size: 1.25rem
          margin-bottom: 0.5rem
        > div:nth-child(2)
          font-size: 1rem
          font-size: 2.375rem
          font-weight: bold
          display: flex
          svg
            width: 1.75rem
            margin-right: 0.5rem

  @media (max-width: 767.98px)
    .affiliates-page .status
      grid-template-columns: 1fr

`)
