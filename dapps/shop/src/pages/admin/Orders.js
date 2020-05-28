import React, { useState, useRef, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import dayjs from 'dayjs'
import get from 'lodash/get'

import formatPrice from 'utils/formatPrice'
// import Paginate from 'components/Paginate'

import useOrders from 'utils/useOrders'

function filterOrders(orders, search) {
  if (!search) {
    return orders
  }
  search = search.toLowerCase()
  // Filter by order ids, eg: "ids:1-001-123-456,1-001-123-789"
  if (search.startsWith('ids:')) {
    const ids = search.substr(4).split(',')
    return orders.filter(o => ids.indexOf(o.orderId) >= 0)
  }
  // Otherwise do a basic text search on the order JSON
  return orders.filter(o => {
    const lowered = JSON.stringify(o).toLowerCase()
    return lowered.indexOf(search) >= 0
  })
}

const AdminOrders = () => {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [csv, setCsv] = useState(false)
  const searchRef = useRef(null)
  const { orders, loading, reload } = useOrders()
  const filteredOrders = filterOrders(orders, search)

  useEffect(() => {
    searchRef.current.addEventListener('search', e => setSearch(e.target.value))
  }, [searchRef])

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

function customerName(order) {
  const firstName = get(order, 'data.userInfo.firstName', '')
  const lastName = get(order, 'data.userInfo.lastName', '')
  return `${firstName} ${lastName}`
}

const AdminOrdersTable = ({ orders }) => {
  const history = useHistory()

  return (
    <table className="table admin-orders table-hover">
      <thead>
        <tr>
          <th>Order</th>
          <th>Time</th>
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
            <td>{dayjs(order.createdAt).format('MMM D, h:mm A')}</td>
            <td>{customerName(order)}</td>
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
