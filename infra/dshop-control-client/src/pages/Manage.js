import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route, withRouter } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import axios from 'axios'

import Orders from 'pages/Manage/Orders'
import Discounts from 'pages/Manage/Discounts'
import Navigation from 'components/Manage/Navigation'
import store from '@/store'

const Manage = props => {
  const [expandSidebar, setExpandSidebar] = useState(false)
  const [loading, setLoading] = useState(true)
  const [shopIndex, setShopIndex] = useState(0)

  const backendConfig = useStoreState(store, s => s.backend)
  const shops = useStoreState(store, s => s.shops)

  useEffect(
    () =>
      props.history.listen(() => {
        setExpandSidebar(false)
      }),
    []
  )

  useEffect(() => {
    const fetchShops = async () => {
      console.debug('Fetching shops...')
      const response = await axios.get(`${backendConfig.url}/shop`)
      if (response.data.shops) {
        store.update(s => {
          s.shops = response.data.shops
        })
      }
      setLoading(false)
    }
    fetchShops()
  }, [])

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const handleShopChange = event => {
    console.log(event.target.value)
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
                onChange={handleShopChange}
                value={authToken}
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
                  <Route
                    path="/manage/orders"
                    render={props => (
                      <Orders {...props} shop={shops[shopIndex]} />
                    )}
                  />
                  <Route
                    path="/manage/discounts"
                    render={props => (
                      <Discounts {...props} shop={shops[shopIndex]} />
                    )}
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
