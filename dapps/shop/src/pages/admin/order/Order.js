import React from 'react'
import { NavLink, useRouteMatch, Switch, Route } from 'react-router-dom'

import useOrder from 'utils/useOrder'
import { useStateValue } from 'data/state'

import Link from 'components/Link'

import OrderDetails from './Details'
import Printful from './Printful'

const AdminOrder = () => {
  const match = useRouteMatch('/admin/orders/:orderId/:tab?')
  const { orderId, tab } = match.params
  const { order, loading } = useOrder(orderId)
  const [{ admin }] = useStateValue()
  const urlPrefix = `/admin/orders/${orderId}`

  const offerSplit = orderId.split('-')
  const listingId = offerSplit.slice(0, -1).join('-')
  const offerId = Number(offerSplit[offerSplit.length - 1])

  return (
    <>
      <h3 className="admin-title">
        <Link to="/admin/orders" className="muted">
          Orders
        </Link>
        <span className="chevron" />
        {`#${orderId}`}
        <div style={{ fontSize: 18 }} className="ml-auto">
          <Link
            to={`/admin/orders/${listingId}-${offerId - 1}${
              tab ? `/${tab}` : ''
            }`}
          >
            &lt; Older
          </Link>
          <Link
            className="ml-3"
            to={`/admin/orders/${listingId}-${offerId + 1}${
              tab ? `/${tab}` : ''
            }`}
          >
            Newer &gt;
          </Link>
        </div>
      </h3>
      <ul className="nav nav-tabs mt-3 mb-4">
        <li className="nav-item">
          <NavLink className="nav-link" to={urlPrefix} exact>
            Details
          </NavLink>
        </li>
        {admin.role !== 'admin' ? null : (
          <li className="nav-item">
            <NavLink className="nav-link" to={`${urlPrefix}/printful`}>
              Printful
            </NavLink>
          </li>
        )}
        {admin.role !== 'admin' ? null : (
          <li className="nav-item">
            <NavLink className="nav-link" to={`${urlPrefix}/payment`}>
              Payment
            </NavLink>
          </li>
        )}
      </ul>
      {loading ? (
        'Loading...'
      ) : (
        <Switch>
          <Route path={`${urlPrefix}/printful`}>
            <Printful />
          </Route>
          <Route path={`${urlPrefix}/payment`}>Payment</Route>
          <Route>
            <OrderDetails order={order} />
          </Route>
        </Switch>
      )}
    </>
  )
}

export default AdminOrder

require('react-styl')(`
  .nav-tabs
    .nav-link
      padding: 0.5rem 0.25rem
      margin-right: 2rem
      border-width: 0 0 4px 0
      color: #666666
      &:hover
        border-color: transparent
      &.active
        border-color: #3b80ee
        color: #000
`)
