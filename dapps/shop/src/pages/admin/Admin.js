import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route } from 'react-router-dom'
import Styl from 'react-styl'
import 'components/admin/Styles'

import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
import dataUrl from 'utils/dataUrl'

import Login from 'components/admin/Login'
import Products from './Products'
import Collections from './Collections'
import Dashboard from './Dashboard'
import Orders from './Orders'
import Discounts from './discounts/Discounts'
import EditDiscount from './discounts/EditDiscount'
import Order from './order/Order'
import Settings from './settings/Settings'
import Events from './Events'
import Menu from './_Menu'

const Admin = () => {
  const { config } = useConfig()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()

  useEffect(() => {
    if (!window.adminCss) {
      // Need to re-add stylesheet as this component is lazy loaded
      Styl.addStylesheet()
      window.adminCss = true
    }

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
