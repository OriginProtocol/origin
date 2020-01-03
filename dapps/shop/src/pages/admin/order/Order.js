import React from 'react'
import { NavLink, useRouteMatch, Switch, Route } from 'react-router-dom'

import useOrder from 'utils/useOrder'

import OrderDetails from './Details'
import Printful from './Printful'

const AdminOrder = () => {
  const match = useRouteMatch('/admin/orders/:orderId/:tab?')
  const { orderId } = match.params
  const { order, loading } = useOrder(orderId)
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
      {!cart.offerId ? null : <h3>{`Order #${cart.offerId}`}</h3>}
      <ul className="nav nav-tabs mt-3">
        <li className="nav-item">
          <NavLink className="nav-link" to={urlPrefix} exact>
            Details
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`${urlPrefix}/printful`}>
            Printful
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`${urlPrefix}/payment`}>
            Payment
          </NavLink>
        </li>
      </ul>
      <Switch>
        <Route path={`${urlPrefix}/printful`}>
          <Printful />
        </Route>
        <Route path={`${urlPrefix}/payment`}>Payment</Route>
        <Route>
          <OrderDetails cart={cart} />
        </Route>
      </Switch>
    </>
  )
}

export default AdminOrder
