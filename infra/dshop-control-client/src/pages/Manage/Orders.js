import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import moment from 'moment'

import usePaginate from 'utils/usePaginate'
import formatPrice from 'utils/formatPrice'
import Paginate from 'components/Paginate'
import store from '@/store'

const Orders = () => {
  const orders = useStoreState(store, s => s.orders)

  const [redirectTo, setRedirectTo] = useState(null)

  const { start, end } = usePaginate()
  const pagedOrders = orders.slice(start, end)

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
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
        <table className="table table-condensed table-bordered table-striped table-hover">
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
                <tr
                  key={i}
                  onClick={() =>
                    setRedirectTo(`/manage/orders/${order.orderId}/details`)
                  }
                >
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
