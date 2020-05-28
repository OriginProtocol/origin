import React from 'react'
import { useLocation } from 'react-router-dom'

import useConfig from 'utils/useConfig'
import { useStateValue } from 'data/state'
import Link from 'components/Link'
import Menu from 'components/admin/Menu'
import * as Icons from 'components/icons/Admin'

const AdminMenu = () => {
  const { pathname } = useLocation()
  const { config } = useConfig()
  const [, dispatch] = useStateValue()
  const active = path => (pathname.indexOf(path) === 0 ? 'active' : '')

  return (
    <Menu>
      <li className={`dashboard ${active('/super-admin/dashboard')}`}>
        <Link to="/super-admin/dashboard">
          <Icons.Dashboard />
          Dashboard
        </Link>
      </li>
      <li className={`orders ${active('/super-admin/shops')}`}>
        <Link to="/super-admin/shops">
          <Icons.Orders />
          Shops
        </Link>
      </li>
      <li className={`settings ${active('/super-admin/settings')}`}>
        <Link to="/super-admin/settings">
          <Icons.Settings />
          Settings
        </Link>
      </li>
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
    </Menu>
  )
}

export default AdminMenu
