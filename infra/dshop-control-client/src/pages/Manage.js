import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route, withRouter } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import axios from 'axios'

import Orders from 'pages/Manage/Orders'
import Order from 'pages/Manage/Order'
import Discounts from 'pages/Manage/Discounts'
import EditDiscount from 'pages/Manage/EditDiscount'
import Navigation from 'components/Manage/Navigation'
import Loading from 'components/Loading'
import store from '@/store'

const Manage = props => {
  const backendConfig = useStoreState(store, s => s.backend)
  const shops = useStoreState(store, s => s.shops)

  const [expandSidebar, setExpandSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shopIndex, setShopIndex] = useState(undefined)

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
    const fetchShops = async () => {
      console.debug('Fetching shops...')
      const response = await axios.get(`${backendConfig.url}/shop`)
      if (response.data.shops) {
        await store.update(s => {
          s.shops = response.data.shops
        })
        handleShopChange(0)
      }
      setLoading(false)
    }
    fetchShops()
  }, [])

  /* Load orders and discounts on shop changes
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!shops[shopIndex]) return

      console.debug('Fetching data...')

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
  }, [shopIndex])

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const handleShopChange = shopIndex => {
    axios.defaults.headers.common[
      'Authorization'
    ] = `Bearer ${shops[shopIndex].authToken}`
    setShopIndex(shopIndex)
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="wrapper">
      <Navigation
        onExpandSidebar={toggleSidebar}
        expandSidebar={expandSidebar}
      />
      <div id="main" className={expandSidebar ? 'd-none' : ''}>
        {shops && shops.length > 1 && (
          <div className="row">
            <div className="col-6 col-md-4">
              <select
                className="form-control"
                onChange={() => handleShopChange(event.target.value)}
                value={shopIndex}
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
