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
      store.update(s => {
        s.shops = response.data
      })
      setLoading(false)
    }
    fetchShops()
  }, [])

  const toggleSidebar = () => {
    setExpandSidebar(!expandSidebar)
  }

  const renderLoading = () => {
    return 'Loading...'
  }

  const renderNoShops = () => {
    return 'No shops found'
  }

  if (loading) {
    return renderLoading()
  }

  if (shops.length === 0) {
    return renderNoShops()
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
            <Route path="/manage/orders" component={Orders} />
            <Route path="/manage/discounts" component={Discounts} />
            <Redirect to="/manage/orders" />
          </Switch>
        </div>
      </div>
    </div>
  )
}

export default withRouter(Manage)
