import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useStoreState } from 'pullstate'
import moment from 'moment'

import usePaginate from 'utils/usePaginate'
import formatPrice from 'utils/formatPrice'
import Loading from 'components/Loading'
import Paginate from 'components/Paginate'
import store from '@/store'

const Orders = ({ shop }) => {
  const backendConfig = useStoreState(store, s => s.backend)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      console.debug('Fetching orders...')
      const response = await axios.get(`${backendConfig.url}/orders`, {
        headers: {
          Authorization: `Bearer ${shop.authToken}`
        }
      })

      setOrders(response.data)
      setLoading(false)
    }
    fetchOrders()
  }, [])

  const { start, end } = usePaginate()
  const pagedOrders = orders.slice(start, end)

  if (loading) {
    return <Loading />
  }

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
            {pagedOrders.map((order, i) => {
              const data = JSON.parse(order.data)
              return (
                <tr key={i}>
                  <td>{order.orderId}</td>
                  <td>{moment(order.createdAt).format('L')}</td>
                  <td>{data.paymentMethod.label}</td>
                  <td>Pending</td>
                  <td>{formatPrice(data.total)}</td>
                </tr>
              )
            })}
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
