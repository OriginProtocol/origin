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
import SignIn from 'pages/SignIn'
//import Navigation from 'components/Edit/Navigation'
import Navigation from 'components/Navigation'
import axios from 'utils/axiosWithCredentials'

import store from '@/store'

const Edit = props => {
  // TODO: We just expecting a global here?
  const ethNetworkId = Number(web3.currentProvider.chainId)
  const { addToast } = useToasts()
  const [loginRequired, setLoginRequired] = useState(false)
  const settings = useStoreState(store, s => s.settings)
  const backendConfig = useStoreState(store, s => s.backend)
  const shops = useStoreState(store, s => s.shops)
  const needsDeploy = useStoreState(store, s => s.needsDeploy)
  const dataURL = useStoreState(store, s => s.dataURL)
  const authenticated = useStoreState(store, s => s.hasAuthenticated)
  const selectedShopIndex = useStoreState(store, s => s.selectedShopIndex)

  const [expandSidebar, setExpandSidebar] = useState(false)

  useEffect(() => {
    props.history.listen(() => {
      // FIXME: State change error
      //setExpandSidebar(false)
    })

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
  }, [])

  /* Load shops config if we're operating on an existing one
   */
  useEffect(() => {
    if (!authenticated) return
    const fetchShops = async () => {
      console.debug('Fetching shops...')
      const response = await axios.get(`${backendConfig.url}/shop`)
      if (response.data.shops) {
        await store.update(s => {
          s.shops = response.data.shops
        })
      }
    }

    if (!dataURL && shops && shops.length > 0) {
      store.update(s => {
        s.dataURL = shops[selectedShopIndex].dataUrl
      })
    }
    fetchShops()
  }, [])

  useEffect(() => {
    /**
     * A little redundant considering DeployWizard/Password, but best to get it
     * done now if we know the shop exists on the backend. That prompt also
     * won't work if backend deets aren't set(e.g. backend.email).
     */
    if (
      settings &&
      settings.networks[ethNetworkId] &&
      settings.networks[ethNetworkId].listingId
    ) {
      setLoginRequired(true)
    }
  }, [settings])

  if (loginRequired && !authenticated) {
    return (
      <SignIn
        redirectTo={props.location.pathname}
        text="Sign in is required for this shop"
      />
    )
  }

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const location = useLocation()

  return (
    <div className="wrapper">
      <Navigation
        onExpandSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
        dataURL={dataURL}
        authenticated={authenticated}
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
