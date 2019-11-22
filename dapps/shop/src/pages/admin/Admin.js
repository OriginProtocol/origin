import React from 'react'
import { Redirect, Switch, Route, useLocation } from 'react-router-dom'

import { useStateValue } from 'data/state'
import Link from 'components/Link'

import Products from './Products'
import Collections from './Collections'
import Orders from './Orders'
import Order from './Order'
import Login from './Login'

const SiteTitle = process.env.SITE_FULL_TITLE || process.env.SITE_TITLE

const Settings = () => (
  <div>
    <h3>Settings</h3>
  </div>
)

const Admin = () => {
  const { pathname } = useLocation()

  const [{ admin }, dispatch] = useStateValue()
  if (!admin) {
    return <Login />
  }

  return (
    <div className="container admin">
      <h1 className="mb-3">{`${SiteTitle} Admin`}</h1>
      <div className="row">
        <div className="col-3">
          <h3>&nbsp;</h3>
          <div className="categories">
            <ul className="list-unstyled">
              <li
                className={
                  pathname.indexOf('/admin/orders') === 0 ? 'active' : ''
                }
              >
                <Link to="/admin/orders">Orders</Link>
              </li>
              <li className={pathname === '/admin/products' ? 'active' : ''}>
                <Link to="/admin/products">Products</Link>
              </li>
              <li className={pathname === '/admin/collections' ? 'active' : ''}>
                <Link to="/admin/collections">Collections</Link>
              </li>
              {/* <li className={pathname === '/admin/settings' ? 'active' : ''}>
                <Link to="/admin/settings">Settings</Link>
              </li> */}
              <li className="db">
                <a
                  href="#logout"
                  onClick={e => {
                    e.preventDefault()
                    dispatch({ type: 'logout' })
                  }}
                >
                  Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-9">
          <Switch>
            <Route path="/admin/products" component={Products} />
            <Route path="/admin/collections" component={Collections} />
            <Route path="/admin/settings" component={Settings} />
            <Route path="/admin/orders/:id" component={Order} />
            <Route path="/admin/orders" component={Orders} />
            <Redirect to="/admin/orders" />
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default Admin

require('react-styl')(`
  .admin
    margin-top: 2rem
    h1
      font-size: 24px
`)
