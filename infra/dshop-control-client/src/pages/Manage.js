import React, { useEffect, useState } from 'react'
import { Redirect, Switch, Route, withRouter } from 'react-router-dom'

import Orders from 'pages/Manage/Orders'
import Discounts from 'pages/Manage/Discounts'
import Navigation from 'components/Manage/Navigation'

const Manage = props => {
  const [expandSidebar, setExpandSidebar] = useState(false)

  useEffect(
    () =>
      props.history.listen(() => {
        setExpandSidebar(false)
      }),
    []
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
