import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
import dataUrl from 'utils/dataUrl'

import Products from './Products'
import Collections from './Collections'
import Dashboard from './Dashboard'
import Orders from './Orders'
import Discounts from './discounts/Discounts'
import EditDiscount from './discounts/EditDiscount'
import Order from './order/Order'
import Login from './Login'
import Settings from './settings/Settings'
import Events from './Events'
import Menu from './_Menu'

const Admin = () => {
  const { config } = useConfig()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  useEffect(() => {
    fetch(`${config.backend}/auth`, {
      credentials: 'include',
      headers: {
        authorization: `bearer ${config.backendAuthToken}`
      }
    })
      .then(async response => {
        if (response.status === 200) {
          const auth = await response.json()
          dispatch({ type: 'setAuth', auth })
        }
        setLoading(false)
      })
      .catch(() => {
        setError(true)
      })
  }, [])

  const [{ admin }, dispatch] = useStateValue()

  if (error) {
    return <div className="fixed-loader">Admin Connection Error</div>
  } else if (loading) {
    return <div className="fixed-loader">Loading...</div>
  }

  if (!admin) {
    return <Login />
  }

  return (
    <div className="admin">
      <nav>
        <div className="container">
          <h1>
            {config.logo ? (
              <img src={`${dataUrl()}${config.logo}`} />
            ) : (
              config.title
            )}
            <div>Admin</div>
          </h1>
          <div>{`Welcome, ${admin.email}`}</div>
        </div>
      </nav>
      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <Menu />
          </div>
          <div className="col-md-9">
            <Switch>
              <Route path="/admin/discounts/:id" component={EditDiscount} />
              <Route path="/admin/discounts" component={Discounts} />
              <Route path="/admin/products" component={Products} />
              <Route path="/admin/collections" component={Collections} />
              <Route path="/admin/settings" component={Settings} />
              <Route path="/admin/events" component={Events} />
              <Route path="/admin/orders/:id" component={Order} />
              <Route path="/admin/orders" component={Orders} />
              <Route path="/admin/dashboard" component={Dashboard} />
              <Redirect to="/admin/dashboard" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

require('react-styl')(`
  .fixed-loader
    position: fixed
    left: 50%
    top: 50%
    font-size: 2rem
    transform: translate(-50%, -50%)

  .admin
    margin-bottom: 5rem
    -webkit-font-smoothing: antialiased
    h1,h2,h3
      color: #000
    h1
      font-size: 24px
    nav
      border-bottom: 1px solid #dfe2e6
      padding: 1.25rem 0
      margin-bottom: 4rem
      color: #000
      > .container
        display: flex
        align-items: center
        justify-content: between
        flex-wrap: wrap
      h1
        margin: 0
        display: flex
        flex: 1
        font-size: 1rem
        img
          max-height: 2.5rem
        div
          display: flex
          align-items: center
          margin-left: 1rem
          padding-left: 1rem
          border-left: 1px solid #5666
    .table
      thead
        th
          background-color: #f8f8f8
          font-size: 14px
          color: #666
          font-weight: normal
          border-bottom-width: 1px
          padding: 0.5rem 0.75rem
    form
      label:not(.form-check-label)
        font-weight: 600
    .admin-title
      &.with-border
        padding-bottom: 1rem
        border-bottom: 1px solid #dfe2e6
        margin-bottom: 1.5rem
      .muted
        color: #666
      .chevron
        margin: 0 1rem
        &::before
          content: ""
          display: inline-block
          width: 10px
          height: 10px
          border-width: 0 2px 2px 0
          border-style: solid
          border-color: #3b80ee
          transform: rotate(-45deg) translateY(-4px);
`)
