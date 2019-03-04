import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import withTokenBalance from 'hoc/withTokenBalance'
import withWallet from 'hoc/withWallet'
import withCreatorConfig from 'hoc/withCreatorConfig'

import PageTitle from 'components/PageTitle'

import UnitListing from './listing-types/UnitListing/UnitListing'
import FractionalListing from './listing-types/FractionalListing/FractionalListing'
import AnnouncementListing from './listing-types/AnnouncementListing/AnnouncementListing'

import ChooseListingType from './ChooseListingType'
import Boost from './Boost'
import Availability from './Availability'
import Review from './Review'

import Store from 'utils/store'
const store = Store('sessionStorage')

class CreateListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listing: {
        __typename: 'UnitListing', // Default
        title: '',
        description: '',
        category: '',
        subCategory: '',
        location: '',
        boost: '50',
        boostLimit: '100',
        media: [],

        // Unit fields:
        quantity: '1',
        price: '',

        // Marketplace creator fields:
        marketplacePublisher: get(props, 'creatorConfig.marketplacePublisher'),

        ...store.get('create-listing', {})
      }
    }
  }

  setListing(listing) {
    store.set('create-listing', listing)
    this.setState({ listing })
  }

  render() {

    const listingTypeMapping = {
      'UnitListing' : UnitListing,
      'AnnouncementListing' : AnnouncementListing,
      'FractionalListing' : FractionalListing
    }
    const ListingTypeComponent =
      (this.state.listing.__typename in listingTypeMapping) ?
      listingTypeMapping[this.state.listing.__typename] :
      UnitListing

    return (
      <div className="container create-listing">
        <PageTitle>Add a Listing</PageTitle>
        <Switch>
          <Route
            path="/create/details/:step?"
            render={({match}) => (
              <ListingTypeComponent
                listing={this.state.listing}
                step={match.params.step}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
          <Route
            path="/create"
            render={() => (
              <ChooseListingType
                listing={this.state.listing}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
        </Switch>
      </div>
    )
  }
}

export default withCreatorConfig(withWallet(withTokenBalance(CreateListing)))

require('react-styl')(`
  .create-listing
    padding-top: 3rem
    .gray-box
      border-radius: var(--default-radius)
      padding: 2rem
      background-color: var(--pale-grey-eight)

    .step
      font-family: var(--default-font)
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem
    .step-description
      font-family: var(--heading-font)
      font-size: 24px
      font-weight: 300
      line-height: normal

    .actions
      margin-top: 2.5rem
      display: flex
      justify-content: space-between
      .btn
        min-width: 10rem
        border-radius: 2rem
        padding: 0.625rem
        font-size: 18px

  @media (max-width: 767.98px)
    .create-listing
      padding-top: 1rem
      .actions
        margin-top: 2rem
        .btn
          min-width: auto
          flex: 1
          margin: 0 0.5rem
          &:first-child
            margin-left: 0
          &:last-child
            margin-right: 0
        margin-bottom: 2rem

`)
