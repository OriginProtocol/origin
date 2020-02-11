import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import dayjs from 'dayjs'

import axios from 'utils/axiosWithCredentials'
import usePaginate from 'utils/usePaginate'
import Loading from 'components/Loading'
import Paginate from 'components/Paginate'
import store from '@/store'

function description(discount) {
  let str = `$${discount.value} off entire order`
  if (discount.discountType === 'percentage') {
    str = `${discount.value}% off entire order`
  }
  if (discount.onePerCustomer) {
    return <>{str} &bull; One per customer</>
  }
  return str
}

function active(discount) {
  const start = dayjs(discount.startTime).format('MMM D')
  if (discount.endTime) {
    const end = dayjs(discount.endTime).format('MMM D')
    return `${start} - ${end}`
  }
  return `From ${start}`
}

const Discounts = () => {
  const backendConfig = useStoreState(store, s => s.backend)
  const discounts = useStoreState(store, s => s.discounts)

  const [redirectTo, setRedirectTo] = useState(false)

  const { start, end } = usePaginate()
  const pagedDiscounts = discounts.slice(start, end)

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Discounts</h3>
        {/*
        <SortBy />
        */}
      </div>
      <Link to="/manage/discounts/new">
        <button className="btn btn-primary my-3">Create Discount</button>
      </Link>
      {pagedDiscounts.length > 0 ? (
        <table className="table table-condensed table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Uses</th>
              <th>Valid</th>
            </tr>
          </thead>
          <tbody>
            {pagedDiscounts.map((discount, i) => {
              return (
                <tr
                  key={i}
                  onClick={() =>
                    setRedirectTo(`/manage/discounts/${discount.id}`)
                  }
                >
                  <td>
                    <div className="font-weight-bold">
                      {discount.code.toUpperCase()}
                    </div>
                    <div className="text-muted">{description(discount)}</div>
                  </td>
                  <td>
                    {discount.status === 'inactive' ? (
                      <span className="badge badge-danger">Inactive</span>
                    ) : (
                      <span className="badge badge-success">Active</span>
                    )}
                  </td>
                  <td>{`${discount.used || '0'}${
                    discount.maxUses ? `/${discount.maxUses}` : ''
                  } used`}</td>
                  <td>{active(discount)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-muted text-center bg-light rounded">
          You don&apos;t have any discounts yet
        </div>
      )}

      <Paginate total={discounts.length} />
    </>
  )
}

export default Discounts
