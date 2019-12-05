import React from 'react'
import { useHistory } from 'react-router-dom'
import dayjs from 'dayjs'

import Paginate from 'components/Paginate'
import Link from 'components/Link'

import useRest from 'utils/useRest'

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

const AdminDiscounts = () => {
  const history = useHistory()
  const { data: discounts = [], loading } = useRest('/discounts')
  return (
    <>
      <div className="d-flex justify-content-between align-items-center">
        <h3>Discounts</h3>
        <Link to="/admin/discounts/new" className="btn btn-primary btn-sm">
          Create discount
        </Link>
      </div>
      {loading ? (
        'Loading...'
      ) : (
        <table className="table admin-discounts table-hover">
          <thead>
            <tr>
              <th>Code</th>
              <th>Status</th>
              <th>Used</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {discounts.map(discount => (
              <tr
                key={discount.id}
                onClick={() => {
                  history.push(`/admin/discounts/${discount.id}`)
                }}
              >
                {/* <td>{dayjs(discount.createdAt).format('MMM D, h:mm A')}</td> */}
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
            ))}
          </tbody>
        </table>
      )}

      <Paginate total={discounts.length} />
    </>
  )
}

export default AdminDiscounts

require('react-styl')(`
  .admin-orders
    tbody tr
      cursor: pointer
`)
