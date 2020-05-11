import React from 'react'
import get from 'lodash/get'
import dayjs from 'dayjs'
import { useHistory } from 'react-router-dom'

import { useStateValue } from 'data/state'

import Paginate from 'components/Paginate'
import Link from 'components/Link'

const AdminShops = () => {
  const [{ admin }] = useStateValue()
  const history = useHistory()

  const shops = get(admin, 'shops', [])

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="m-0">Shops</h3>
        <Link to="/super-admin/shops/new" className="btn btn-primary">
          Create shop
        </Link>
      </div>
      <table className="table admin-discounts table-hover">
        <thead>
          <tr>
            <th>Name</th>
            <th>Listing ID</th>
            <th>Created</th>
            <th>Data Dir</th>
          </tr>
        </thead>
        <tbody>
          {shops.map(shop => (
            <tr
              key={shop.id}
              onClick={() => {
                history.push(`/admin/super-admin/${shop.id}`)
              }}
            >
              <td>{shop.name}</td>
              <td>{shop.listingId}</td>
              <td>{dayjs(shop.createdAt).format('MMM D, h:mm A')}</td>
              <td>{shop.authToken}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Paginate total={shops.length} />
    </>
  )
}

export default AdminShops
