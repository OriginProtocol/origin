import React, { useEffect, useState } from 'react'
import { useStoreState } from 'pullstate'
import { Redirect, Switch, Route, withRouter } from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'

import Collections from 'pages/Dashboard/Collections'
import CollectionAdd from 'pages/Dashboard/CollectionAdd'
import CollectionEdit from 'pages/Dashboard/CollectionEdit'
import Products from 'pages/Dashboard/Products'
import ProductAdd from 'pages/Dashboard/ProductAdd'
import ProductEdit from 'pages/Dashboard/ProductEdit'
import Settings from 'pages/Dashboard/Settings'
import DeployButton from 'components/DeployButton'
import Navigation from 'components/Navigation'

import store from '@/store'

const Dashboard = props => {
  const { addToast } = useToasts()
  const needsDeploy = useStoreState(store, s => s.needsDeploy)

  const [expandSidebar, setExpandSidebar] = useState(false)

  useEffect(
    () =>
      props.history.listen(() => {
        setExpandSidebar(false)
      }),
    []
  )

  // Subscribe to pullstate changes and store in local storage
  store.subscribe(
    s => s,
    () => {
      if (!needsDeploy) {
        store.update(s => {
          s.needsDeploy = true
        })
        addToast(
          'Your Dshop needs to be redeployed for the changes to take effect',
          {
            appearance: 'success',
            autoDismiss: true
          }
        )
      }
    }
  )

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  return (
    <div className="wrapper">
      <Navigation
        onExpandSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
      />
      <div id="main" className={expandSidebar ? 'd-none' : ''}>
        <div className="mt-4">
          <Switch>
            <Route path="/dashboard/products/add" component={ProductAdd} />
            <Route
              path="/dashboard/products/edit/:productId(\d+)"
              component={ProductEdit}
            />
            <Route exact path="/dashboard/products" component={Products} />
            <Route
              path="/dashboard/collections/add"
              component={CollectionAdd}
            />
            <Route
              path="/dashboard/collections/edit/:collectionId(\d+)"
              component={CollectionEdit}
            />
            <Route
              exact
              path="/dashboard/collections"
              component={Collections}
            />
            <Route path="/dashboard/settings" component={Settings} />
            <Redirect to="/dashboard/products" />
          </Switch>
        </div>
      </div>
      {needsDeploy && (
        <div
          className="fixed-bottom"
          style={{
            right: 'auto',
            bottom: '70px',
            left: '40px',
            width: '200px'
          }}
        >
          <DeployButton />
        </div>
      )}
    </div>
  )
}

export default withRouter(Dashboard)
