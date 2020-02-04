import React, { useEffect } from 'react'
import axios from 'axios'
import { useStoreState } from 'pullstate'

import usePaginate from 'utils/usePaginate'
import formatPrice from 'utils/formatPrice'
import Paginate from 'components/Paginate'
import store from '@/store'

const Orders = () => {
  const backendConfig = useStoreState(store, s => s.backend)

  useEffect(() => {
    const fetchOrders = async () => {
      console.debug('Fetching orders...')
      const response = await axios.get(`${backendConfig.url}/orders`)
      store.update(s => (s.orders = response.data))
    }
    fetchOrders()
  }, [])

  const orders = useStoreState(store, s => s.orders) || []
  const { start, end } = usePaginate()
  const pagedOrders = orders.slice(start, end)

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Orders</h3>
        {/*
        <SortBy />
        */}
      </div>
      {pagedOrders.length > 0 ? (
        <table className="table table-condensed table-bordered table-striped">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {pagedOrders.map((order, i) => (
              <tr key={i}>
                <td>{order.title}</td>
                <td>{order.created_at}</td>
                <td>{order.payment}</td>
                <td>{order.status}</td>
                <td>{formatPrice(order.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-muted text-center bg-light rounded">
          You don&apos;t have any orders yet
        </div>
      )}

      <Paginate total={orders.length} />
    </>
  )
}

export default Orders

require('react-styl')(``)
