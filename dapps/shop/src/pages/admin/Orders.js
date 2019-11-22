import React from 'react'
import { useHistory } from 'react-router-dom'

import formatPrice from 'utils/formatPrice'
import Paginate from 'components/Paginate'

import useOrders from 'utils/useOrders'

const AdminOrders = () => {
  const history = useHistory()
  const orders = useOrders()
  return (
    <>
      <h3>Orders</h3>
      <table className="table admin-orders table-hover">
        <thead>
          <tr>
            <th>Order</th>
            <th>Date</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr
              key={order.id}
              onClick={() => {
                history.push(`/admin/orders/${order.order_id}`)
              }}
            >
              <td>{order.order_id}</td>
              <td>{order.date}</td>
              <td>{order.data.paymentMethod.label}</td>
              <td>{order.status}</td>
              <td>{formatPrice(order.data.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Paginate total={orders.length} />
    </>
  )
}

export default AdminOrders

require('react-styl')(`
  .admin-orders
    tbody tr
      cursor: pointer
`)
