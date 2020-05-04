import React, { useState } from 'react'
import sortBy from 'lodash/sortBy'
import dayjs from 'dayjs'

import formatPrice from 'utils/formatPrice'

import useOrders from 'utils/useOrders'
import useProducts from 'utils/useProducts'
import dataUrl from 'utils/dataUrl'

import Chart from './_Chart'

const AdminDashboard = () => {
  const { orders, loading } = useOrders()
  const { products } = useProducts()
  const [sort, setSort] = useState('orders')
  const [range, setRange] = useState('all-time')

  if (loading) {
    return 'Loading...'
  }

  const startOfDay = dayjs().startOf('day')
  const filteredSales = orders.filter(i => {
    if (!i || !i.data || !i.data.total) return false
    const createdDay = dayjs(i.createdAt).startOf('day')
    if (
      range === '7-days' &&
      createdDay.isBefore(startOfDay.subtract(7, 'days'))
    ) {
      return false
    } else if (
      range === '30-days' &&
      createdDay.isBefore(startOfDay.subtract(30, 'days'))
    ) {
      return false
    } else if (range === 'today' && createdDay.isBefore(startOfDay)) {
      return false
    } else if (
      range === 'yesterday' &&
      (createdDay.isBefore(startOfDay.subtract(1, 'days')) ||
        createdDay.isAfter(startOfDay))
    ) {
      return false
    }
    return true
  })

  const totalSales = filteredSales.reduce((m, o) => {
    m += o.data.total
    return m
  }, 0)

  const topProductsRaw = orders
    .map(o => o.data.items)
    .flat()
    .filter(i => i)
    .reduce((m, o) => {
      m[o.product] = m[o.product] || { revenue: 0, orders: 0 }
      m[o.product].orders += o.quantity
      m[o.product].revenue += o.price * o.quantity
      return m
    }, {})

  const topProducts = sortBy(Object.entries(topProductsRaw), o => -o[1][sort])
    .slice(0, 10)
    .map(([productId, stats]) => {
      const product = products.find(p => p.id === productId)
      return product ? { ...product, ...stats } : null
    })
    .filter(p => p)

  return (
    <>
      <div className="d-flex mb-3 align-items-center">
        <h3 className="m-0">Dashboard</h3>
        <div className="ml-auto">
          Range:
          <select
            className="ml-2"
            value={range}
            onChange={e => setRange(e.target.value)}
          >
            <option value="all-time">All time</option>
            <option value="30-days">Last 30 days</option>
            <option value="7-days">Last 7 days</option>
            <option value="yesterday">Yesterday</option>
            <option value="today">Today</option>
          </select>
        </div>
      </div>
      <div className="admin-dashboard-stats">
        <div>
          <div>Total orders</div>
          <div>{filteredSales.length}</div>
        </div>
        <div>
          <div>Total revenue</div>
          <div>{formatPrice(totalSales)}</div>
        </div>
        {/* <h5 className="ml-4">{`${formatPrice(totalSales * 0.05)} profit`}</h5> */}
      </div>
      <div className="mt-4">
        <Chart orders={orders} />
      </div>

      <table className="table admin-products mt-4">
        <thead>
          <tr>
            <th colSpan="2">Top Products</th>
            <th className="text-center">
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  setSort('orders')
                }}
              >
                Sales{sort === 'orders' ? <> &#8595;</> : null}
              </a>
            </th>
            <th className="text-center">
              <a
                href="#"
                onClick={e => {
                  e.preventDefault()
                  setSort('revenue')
                }}
              >
                Revenue{sort === 'revenue' ? <> &#8595;</> : null}
              </a>
            </th>
          </tr>
        </thead>
        <tbody>
          {topProducts.map(product => (
            <tr key={product.id}>
              <td>
                <div
                  className="pic"
                  style={{
                    backgroundImage: `url(${dataUrl()}${product.id}/520/${
                      product.image
                    })`
                  }}
                />
              </td>
              <td>
                <div className="title">{product.title}</div>
                <div className="price">{formatPrice(product.price)}</div>
              </td>
              <td className="text-center">{product.orders}</td>
              <td className="text-center">{formatPrice(product.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

export default AdminDashboard

require('react-styl')(`
  .admin-dashboard-stats
    display: flex
    color: #000
    max-width: 600px
    > div
      flex: 1
      border: 1px solid #dfe2e6
      border-radius: 10px
      padding: 0.875rem 1.5rem
      &:not(:last-child)
        margin-right: 1.5rem
      > div:nth-child(1)
        font-size: 16px
      > div:nth-child(2)
        font-size: 36px
        font-weight: 600
`)
