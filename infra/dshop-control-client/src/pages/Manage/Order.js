import React, { useEffect, useState } from 'react'
import {
  NavLink,
  Redirect,
  Route,
  Switch,
  useRouteMatch
} from 'react-router-dom'
import { useStoreState } from 'pullstate'

import OrderDetail from 'pages/Manage/Order/Detail'
import Printful from 'pages/Manage/Order/Printful'
import store from '@/store'

const Order = () => {
  const match = useRouteMatch('/manage/orders/:orderId')
  const { orderId } = match.params
  const orders = useStoreState(store, s => s.orders)

  const order = orders.find(o => o.orderId === orderId)
  const cart = JSON.parse(order.data)

  const urlPrefix = `/manage/orders/${orderId}`

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Order {order.orderId}</h3>
      </div>
      <ul className="nav nav-tabs my-3">
        <li className="nav-item">
          <NavLink className="nav-link" to={`${urlPrefix}/details`} exact>
            Details
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to={`${urlPrefix}/printful`}>
            Printful
          </NavLink>
        </li>
      </ul>

      <Switch>
        <Route
          path="/manage/orders/:orderId/details"
          render={props => <OrderDetail {...props} cart={cart} />}
        />
        <Route
          path="/manage/orders/:orderId/printful"
          render={props => <Printful {...props} order={order} />}
        />
        <Redirect to={`/manage/orders/${order.orderId}/details`} />
      </Switch>
    </>
  )
}

export default Order
