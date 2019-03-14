import React, { Component } from 'react'
import pick from 'lodash/pick'
import get from 'lodash/get'

import withCreatorConfig from 'hoc/withCreatorConfig'
import CreateListing from '../create-listing/CreateListing'

class EditListing extends Component {
  constructor(props) {
    super(props)
    // Translate listing from schema representation to form
    // representation.
    // TODO: Can we unify field names or otherwise keep knowledge of
    // special fields limited to their file in `listings-types` dir?
    this.state = {
      listing: {
        // HomeShare fields:
        weekendPrice: get(props, 'listing.weekendPrice.amount', ''),
        booked: get(props, 'listing.booked', []),
        customPricing: get(props, 'listing.customPricing', []),
        unavailable: get(props, 'listing.unavailable', []),
        // Hourly
        timeZone: get(props, 'listing.timeZone', ''),
        workingHours: get(props, 'workingHours', []),

        // Marketplace creator fields:
        marketplacePublisher: get(props, 'creatorConfig.marketplacePublisher'),

        ...pick(props.listing, [
          'id',
          '__typename',
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
    return (
      <CreateListing
        listing={this.state.listing}
        refetch={this.props.refetch}
      />
    )
  }
}

export default withCreatorConfig(EditListing)

require('react-styl')(`
`)
