import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import queryString from 'query-string'

import formatPrice from 'utils/formatPrice'
import Paginate from 'components/Paginate'

import useOrders from 'utils/useOrders'

const AdminOrders = () => {
  const location = useLocation()
  const opts = queryString.parse(location.search)
  const { orders, loading } = useOrders()

  return (
    <>
      <h3>Orders</h3>
      {loading ? (
        'Loading...'
      ) : opts.csv ? (
        <AdminOrdersCSV orders={orders} />
      ) : (
        <AdminOrdersTable orders={orders} />
      )}

      <Paginate total={orders.length} />
    </>
  )
}

const AdminOrdersTable = ({ orders }) => {
  const history = useHistory()

  return (
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
              history.push(`/admin/orders/${order.orderId}`)
            }}
          >
            <td>{order.orderId}</td>
            <td>{dayjs(order.createdAt).format('MMM D, h:mm A')}</td>
            <td>{order.data.paymentMethod.label}</td>
            <td>{order.status}</td>
            <td>{formatPrice(order.data.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const AdminOrdersCSV = ({ orders }) => {
  const cols = ['Order', 'Date', 'Payment', 'Total', 'Customer'].join(',')
  const data = orders.reverse().map(order => {
    return [
      order.order_id,
      dayjs(order.createdAt).format('MMM D h:mm A'),
      order.data.paymentMethod.label,
      (order.data.total / 100).toFixed(2),
      `${order.data.userInfo.firstName} ${order.data.userInfo.lastName}`
    ].join(',')
  })
  return <pre>{[cols, ...data].join('\n')}</pre>
}

export default AdminOrders

require('react-styl')(`
  .admin-orders
    tbody tr
      cursor: pointer
`)
