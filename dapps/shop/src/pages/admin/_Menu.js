import React from 'react'
import { useLocation } from 'react-router-dom'

import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'
import Link from 'components/Link'
import * as Icons from 'components/icons/Admin'

const AdminMenu = () => {
  const { pathname } = useLocation()
  const { config } = useConfig()
  const [{ admin }, dispatch] = useStateValue()
  const active = path => (pathname.indexOf(path) === 0 ? 'active' : '')

  return (
    <ul className="admin-menu list-unstyled">
      <li className={`dashboard ${active('/admin/dashboard')}`}>
        <Link to="/admin/dashboard">
          <Icons.Dashboard />
          Dashboard
        </Link>
      </li>
      <li className={`orders ${active('/admin/orders')}`}>
        <Link to="/admin/orders">
          <Icons.Orders />
          Orders
        </Link>
      </li>
      <li className={`products ${active('/admin/products')}`}>
        <Link to="/admin/products">
          <Icons.Products />
          Products
        </Link>
      </li>
      <li className={`collections ${active('/admin/collections')}`}>
        <Link to="/admin/collections">
          <Icons.Collections />
          Collections
        </Link>
      </li>
      <li className={`discounts ${active('/admin/discounts')}`}>
        <Link to="/admin/discounts">
          <Icons.Discounts />
          Discounts
        </Link>
      </li>
      {admin.role !== 'admin' ? null : (
        <li className={`settings ${active('/admin/settings')}`}>
          <Link to="/admin/settings">
            <Icons.Settings />
            Settings
          </Link>
        </li>
      )}
      <li className="db">
        <a
          href="#logout"
          onClick={e => {
            e.preventDefault()

            fetch(`${config.backend}/auth/logout`, {
              method: 'POST',
              credentials: 'include'
            }).then(async response => {
              if (response.status === 200) {
                dispatch({ type: 'logout' })
              }
            })
          }}
        >
          <Icons.Logout />
          Logout
        </a>
      </li>
    </ul>
  )
}

export default AdminMenu

require('react-styl')(`
  .admin-menu
    background-color: #f8f8f8
    border-radius: 10px
    padding: 0.75rem
    margin-right: 0.5rem
    li
      a
        display: flex
        align-items: center
        padding: 0.675rem 0.5rem
        color: #666
        line-height: 0
        svg
          margin-right: 0.5rem
          fill: #666
          display: inline-block
          min-width: 20px
      &.active a
        color: #000
        svg
          fill: #3B80EE

`)
