import React, { useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
// import dayjs from 'dayjs'
import get from 'lodash/get'

import formatPrice from 'utils/formatPrice'
// import Paginate from 'components/Paginate'

import useOrders from 'utils/useOrders'

const AdminOrders = () => {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [csv, setCsv] = useState(false)
  const searchRef = useRef(null)
  const { orders, loading, reload } = useOrders()

  useEffect(() => {
    searchRef.current.addEventListener('search', e => setSearch(e.target.value))
  }, [searchRef])

  let filteredOrders = orders
  if (search) {
    filteredOrders = orders.filter(
      o =>
        JSON.stringify(o)
          .toLowerCase()
          .indexOf(search) >= 0
    )
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 className="m-0">Orders</h3>
        <input
          ref={searchRef}
          type="search"
          className="form-control mx-4"
          placeholder="Search"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={() => reload()}
        >
          &#8635;
        </button>
        <button
          className={`btn btn-sm btn${csv ? '' : '-outline'}-secondary ml-2`}
          onClick={() => setCsv(!csv)}
        >
          CSV
        </button>
      </div>
      {loading ? (
        'Loading...'
      ) : csv ? (
        <AdminOrdersCSV orders={filteredOrders} />
      ) : (
        <AdminOrdersTable orders={filteredOrders} />
      )}

      {/* <Paginate total={orders.length} /> */}
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
          <th>Customer</th>
          <th>Payment</th>
          {/* <th>Status</th> */}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr
            key={order.orderId}
            onClick={() => {
              history.push(`/admin/orders/${order.orderId}`)
            }}
          >
            <td>{order.orderId}</td>
            <td>{`${get(order, 'data.userInfo.firstName', '')} ${get(
              order,
              'data.userInfo.lastName',
              ''
            )}`}</td>
            {/* <td>{dayjs(order.createdAt).format('MMM D, h:mm A')}</td> */}
            <td>{get(order, 'data.paymentMethod.label')}</td>
            {/* <td>{order.status}</td> */}
            <td>{formatPrice(get(order, 'data.total'))}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const fields = `
  Order,orderId
  Payment,data.paymentMethod.label
  Total,data.total,number
  Donation,data.donation,number
  Item IDs,data.items,product
  First Name,data.userInfo.firstName
  Last Name,data.userInfo.lastName
  Email,data.userInfo.email
  Phone,data.userInfo.phone
  Address1,data.userInfo.address1
  Address2,data.userInfo.address2
  City,data.userInfo.city
  Province,data.userInfo.province
  Zip,data.userInfo.zip
  Country,data.userInfo.country`
  .split('\n')
  .filter(i => i)
  .map(i => i.trim().split(','))

const AdminOrdersCSV = ({ orders }) => {
  const cols = fields.map(f => f[0]).join(',')
  const data = orders
    .slice()
    .reverse()
    .map(order => {
      try {
        const joined = fields
          .map(([, field, filter]) => {
            let value = get(order, field, '')
            if (filter === 'number') {
              value = (value / 100).toFixed(2)
            }
            if (filter === 'product') {
              value = value.map(i => i.product).join(',')
            }
            return '"' + value + '"'
          })
          .join(',')
        return joined
      } catch (e) {
        /* Ignore */
      }
    })
  return (
    <div className="admin-orders">
      <textarea
        className="form-control"
        rows="10"
        readOnly
        value={[cols, ...data].filter(a => a).join('\n')}
      />
    </div>
  )
}

export default AdminOrders

require('react-styl')(`
  .admin-orders
    tbody tr
      cursor: pointer
    textarea
      white-space: pre
      overflow: auto
      min-height: calc(100vh - 175px)
`)
