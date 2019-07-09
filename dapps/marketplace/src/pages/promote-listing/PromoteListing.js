import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'

import HowWorks from './HowWorks'
import Amount from './Amount'
import Budget from './Budget'
import Success from './Success'

const PromoteListing = () => {
  const [listing, setListing] = useState({ budget: 0, amount: 0 })
  const listingProps = { listing, onChange: listing => setListing(listing) }
  return (
    <div className="container create-listing promote-listing">
      <Switch>
        <Route
          path={`/promote/:listingId/amount`}
          render={route => <Amount {...route} {...listingProps} />}
        />
        <Route
          path={`/promote/:listingId/budget`}
          render={route => <Budget {...route} {...listingProps} />}
        />
        <Route
          path={`/promote/:listingId/success`}
          render={route => <Success {...route} {...listingProps} />}
        />
        <Route path={`/promote/:listingId`} component={HowWorks} />
      </Switch>
    </div>
  )
}

export default PromoteListing

require('react-styl')(`
`)
