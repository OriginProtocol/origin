import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route, withRouter } from 'react-router-dom'
import { useStoreState } from 'pullstate'

import SignIn from './SignIn'
import Orders from 'pages/Manage/Orders'
import Order from 'pages/Manage/Order'
import Discounts from 'pages/Manage/Discounts'
import EditDiscount from 'pages/Manage/EditDiscount'
import Navigation from 'components/Navigation'
import Loading from 'components/Loading'
import axios from 'utils/axiosWithCredentials'
import store from '@/store'

const Manage = props => {
  const [refetch, setRefetch] = useState(false)
  const backendConfig = useStoreState(store, s => s.backend)
  const shops = useStoreState(store, s => s.shops)
  const dataURL = useStoreState(store, s => s.dataURL)
  const authenticated = useStoreState(store, s => s.hasAuthenticated)
  const selectedShopIndex = useStoreState(store, s => s.selectedShopIndex)

  const [expandSidebar, setExpandSidebar] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      props.history.listen(() => {
        setExpandSidebar(false)
      }),
    []
  )

  /* Load shops and set a current shop on index
   */
  useEffect(() => {
    if (!authenticated) {
      setLoading(false)
      return
    }
    const fetchShops = async () => {
      console.debug('Fetching shops... url:', backendConfig.url)
      const response = await axios.get(`${backendConfig.url}/shop`)
      if (response.data.shops) {
        await store.update(s => {
          s.shops = response.data.shops
        })
      } else if (response.status === 401) {
        store.update(s => {
          s.hasAuthenticated = false
        })
      }
      setLoading(false)
    }
    fetchShops()
  }, [refetch])

  /* Load orders and discounts on shop changes
   */
  useEffect(() => {
    const fetchData = async () => {
      setRefetch(false)
      if (!authenticated || !shops || !shops[selectedShopIndex]) return

      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${shops[selectedShopIndex].authToken}`

      setLoading(true)

      const [orders, discounts] = await Promise.all([
        axios.get(`${backendConfig.url}/orders`),
        axios.get(`${backendConfig.url}/discounts`)
      ])

      store.update(s => {
        s.orders = orders.data
        s.discounts = discounts.data
      })

      setLoading(false)
    }
    fetchData()
  }, [refetch, shops, selectedShopIndex])

  // Inline auth
  if (!authenticated) {
    const redirectTo = window.location.hash
      ? window.location.hash.slice(1)
      : '/manage'
    return (
      <div className="wrapper">
        <Navigation
          onExpandSidebar={toggleSidebar}
          expandSidebar={expandSidebar}
          dataURL={dataURL}
          authenticated={authenticated}
        />
        <div id="main" className={expandSidebar ? 'd-none' : ''}>
          <div className="row login-prompt">
            You must login to use these features
          </div>
          <SignIn redirectTo={redirectTo} />
        </div>
      </div>
    )
  }

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const handleShopChange = shopIndex => {
    store.update(s => {
      s.selectedShopIndex = shopIndex
    })
  }

  if (loading) {
    console.log('loading...')
    return <Loading />
  }

  return (
    <div className="wrapper">
      <Navigation
        onExpandSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
        dataURL={dataURL}
        authenticated={authenticated}
      />
      <div id="main" className={expandSidebar ? 'd-none' : ''}>
        {/*testing... <button onClick={() => setRefetch(true)}>Refresh</button>*/}
        {shops && shops.length > 1 && (
          <div className="row">
            <div className="col-6 col-md-4">
              <select
                className="form-control"
                onChange={() => handleShopChange(event.target.value)}
                value={selectedShopIndex}
              >
                {shops.map((s, index) => (
                  <option value={index} key={index}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mt-4">
          {loading ? (
            'Loading'
          ) : (
            <>
              {shops && shops.length > 0 ? (
                <Switch>
                  <Route exact path="/manage/orders" component={Orders} />
                  <Route path="/manage/orders/:orderId" component={Order} />
                  <Route exact path="/manage/discounts" component={Discounts} />
                  <Route
                    path="/manage/discounts/:discountId"
                    component={EditDiscount}
                  />
                  <Redirect to="/manage/orders" />
                </Switch>
              ) : (
                'No shops found'
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default withRouter(Manage)
