import React, { useState, useEffect } from 'react'
import { Switch, Route } from 'react-router-dom'

import tokenPrice from 'utils/tokenPrice'
import LoadingSpinner from 'components/LoadingSpinner'

import withWallet from 'hoc/withWallet'
import withListing from 'hoc/withListing'
import withTokenBalance from 'hoc/withTokenBalance'

import { getStateFromListing } from 'pages/create-listing/mutations/_listingData'

import HowWorks from './HowWorks'
import Amount from './Amount'
import Budget from './Budget'
import Success from './Success'

const PromoteListing = props => {
  const [listing, setListing] = useState()

  useEffect(() => {
    if (props.listing) {
      const listing = getStateFromListing(props)
      setListing({
        ...listing,
        commission: Math.min(
          props.tokenBalance,
          listing.commissionPerUnit * listing.unitsAvailable
        )
      })
    }
  }, [props.listing, props.tokenBalance])

  if (!listing) {
    return <LoadingSpinner />
  }

  const listingProps = {
    listing,
    listingTokens: tokenPrice(props.listing.deposit),
    multiUnit: props.listing.multiUnit,
    tokenBalance: props.tokenBalance,
    onChange: listing => setListing(listing)
  }

  return (
    <div className="container create-listing promote-listing">
      <Switch>
        <Route
          path="/promote/:listingId/amount"
          render={route => <Amount {...route} {...listingProps} />}
        />
        <Route
          path="/promote/:listingId/budget"
          render={route => <Budget {...route} {...listingProps} />}
        />
        <Route
          path="/promote/:listingId/success"
          render={route => <Success {...route} {...listingProps} />}
        />
        <Route path="/promote/:listingId" component={HowWorks} />
      </Switch>
    </div>
  )
}

export default withWallet(withTokenBalance(withListing(PromoteListing)))

require('react-styl')(`
  .promote-listing
    max-width: 550px
`)
