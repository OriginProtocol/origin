import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import pick from 'lodash/pick'
import get from 'lodash/get'

import PageTitle from 'components/PageTitle'

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
        weekendPrice: get(props, 'listing.weekendPrice.amount', ''),
        booked: get(props, 'listing.booked', []),
        customPricing: get(props, 'listing.customPricing', []),
        unavailable: get(props, 'listing.unavailable', []),

        ...pick(props.listing, [
          'title',
          'description',
          'category',
          'subCategory'
        ]),
        quantity: String(props.listing.unitsTotal),
        price: String(props.listing.price.amount),
        boost: '0',
        boostLimit: '0',
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
        <PageTitle>Edit Listing</PageTitle>
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
            render={() => (
              <Review {...stepProps} refetch={this.props.refetch} />
            )}
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
