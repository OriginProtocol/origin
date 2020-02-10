import React, { useEffect, useState } from 'react'
import { useStoreState } from 'pullstate'
import {
  NavLink,
  Redirect,
  Switch,
  Route,
  useLocation,
  withRouter
} from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'

import Collections from 'pages/Edit/Collections'
import CollectionAdd from 'pages/Edit/CollectionAdd'
import CollectionEdit from 'pages/Edit/CollectionEdit'
import Deploy from 'pages/Edit/Deploy'
import Products from 'pages/Edit/Products'
import ProductAdd from 'pages/Edit/ProductAdd'
import ProductEdit from 'pages/Edit/ProductEdit'
import Settings from 'pages/Edit/Settings'
import Navigation from 'components/Edit/Navigation'

import store from '@/store'

const Edit = props => {
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
    (watched, allState, prevWatched) => {
      if (!needsDeploy) {
        store.update(s => {
          s.needsDeploy = true
        })
        if (!watched.needsDeploy && !prevWatched.needsDeploy) {
          addToast(
            'Your Dshop needs to be redeployed for the changes to take effect',
            {
              appearance: 'success',
              autoDismiss: true
            }
          )
        }
      }
    }
  )

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const location = useLocation()

  return (
    <div className="wrapper">
      <Navigation
        onExpandSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
      />
      <div id="main" className={expandSidebar ? 'd-none' : ''}>
        <div className="mt-4">
          <Switch>
            <Route path="/edit/products/add" component={ProductAdd} />
            <Route
              path="/edit/products/edit/:productId(\d+)"
              component={ProductEdit}
            />
            <Route exact path="/edit/products" component={Products} />
            <Route path="/edit/collections/add" component={CollectionAdd} />
            <Route
              path="/edit/collections/edit/:collectionId(\d+)"
              component={CollectionEdit}
            />
            <Route exact path="/edit/collections" component={Collections} />
            <Route path="/edit/settings" component={Settings} />
            <Route path="/edit/deploy" component={Deploy} />
            <Redirect to="/edit/products" />
          </Switch>
        </div>
      </div>
      {needsDeploy && location.pathname !== '/edit/deploy' && (
        <div
          className="fixed-bottom"
          style={{
            right: 'auto',
            bottom: '70px',
            left: '40px',
            width: '200px'
          }}
        >
          <NavLink to="/edit/deploy" className="btn btn-lg btn-dark btn-block">
            Deploy
          </NavLink>
        </div>
      )}
    </div>
  )
}

export default withRouter(Edit)
