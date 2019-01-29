import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import pick from 'lodash/pick'

import Step1 from '../create-listing/Step1'
import Step2 from '../create-listing/Step2'
import Boost from '../create-listing/Boost'
import Availability from '../create-listing/Availability'
import Review from '../create-listing/Review'

class EditListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listing: {
        // HomeShare fields:
        weekdayPrice: '',
        weekendPrice: '',
        booked: [],
        customPricing: [],
        unavailable: [],

        ...pick(props.listing, [
          'title',
          'description',
          'category',
          'subCategory',
          'weekdayPrice',
          'weekendPrice',
          'booked',
          'customPricing',
          'unavailable'
        ]),
        quantity: String(props.listing.unitsTotal),
        price: String(props.listing.price.amount),
        boost: '0',
        media: props.listing.media
      }
    }
  }

  render() {
    const { category, subCategory } = this.state.listing
    let listingType = 'unit'
    if (category === 'schema.forRent' && subCategory === 'schema.housing') {
      listingType = 'fractional'
    }
    const stepProps = {
      listing: this.state.listing,
      listingId: this.props.listing.id,
      listingType,
      mode: 'edit',
      onChange: listing => this.setState({ listing })
    }
    return (
      <div className="container create-listing">
        <Switch>
          <Route
            path="/listings/:listingID/edit/step-2"
            render={() => <Step2 {...stepProps} />}
          />
          <Route
            path="/listings/:listingID/edit/boost"
            render={() => <Boost {...stepProps} />}
          />
          <Route
            path="/listings/:listingID/edit/availability"
            render={() => <Availability {...stepProps} />}
          />
          <Route
            path="/listings/:listingID/edit/review"
            render={() => <Review {...stepProps} />}
          />
          <Route render={() => <Step1 {...stepProps} />} />
        </Switch>
      </div>
    )
  }
}

export default EditListing

require('react-styl')(`
`)
