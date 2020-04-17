import React, { useState } from 'react'
import sortBy from 'lodash/sortBy'

import formatPrice from 'utils/formatPrice'

import useOrders from 'utils/useOrders'
import useProducts from 'utils/useProducts'
import dataUrl from 'utils/dataUrl'

const AdminDashboard = () => {
  const { orders, loading } = useOrders()
  const { products } = useProducts()
  const [sort, setSort] = useState('orders')

  if (loading) {
    return 'Loading...'
  }

  const totalSales = orders
    .filter(o => o.data && o.data.total)
    .reduce((m, o) => {
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
      <h3>Dashboard</h3>
      <div className="mt-4 d-flex">
        <h5>{`${orders.length} orders`}</h5>
        <h5 className="ml-4">{`${formatPrice(totalSales)} revenue`}</h5>
        {/* <h5 className="ml-4">{`${formatPrice(totalSales * 0.05)} profit`}</h5> */}
        {/* <select className="ml-auto">
          <option>All time</option>
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Yesterday</option>
          <option>Today</option>
        </select> */}
      </div>

      <table className="table admin-products mt-4">
        <thead>
          <tr>
            <th />
            <th>Top Products</th>
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
                <div>{product.title}</div>
                <div>{formatPrice(product.price)}</div>
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
`)
