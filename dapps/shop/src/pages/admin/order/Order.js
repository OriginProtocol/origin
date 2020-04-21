import React from 'react'
import { NavLink, useRouteMatch, Switch, Route } from 'react-router-dom'

import useOrder from 'utils/useOrder'
import { useStateValue } from 'data/state'

import Link from 'components/Link'

import OrderDetails from './Details'
import Printful from './Printful'

const AdminOrder = () => {
  const match = useRouteMatch('/admin/orders/:orderId/:tab?')
  const { orderId } = match.params
  const { order, loading } = useOrder(orderId)
  const [{ admin }] = useStateValue()
  const urlPrefix = `/admin/orders/${orderId}`

  if (loading) {
    return 'Loading...'
  }
  if (!order) {
    return 'Order not found'
  }
  const cart = order.data
  return (
    <>
      <h3 className="admin-title">
        <Link to="/admin/orders" className="muted">
          Orders
        </Link>
        <span className="chevron" />
        {!cart.offerId ? null : `#${cart.offerId}`}
      </h3>
      <ul className="nav nav-tabs mt-3">
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
      <Switch>
        <Route path={`${urlPrefix}/printful`}>
          <Printful />
        </Route>
        <Route path={`${urlPrefix}/payment`}>Payment</Route>
        <Route>
          <OrderDetails order={order} />
        </Route>
      </Switch>
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