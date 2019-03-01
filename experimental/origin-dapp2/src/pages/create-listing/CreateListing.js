import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import withTokenBalance from 'hoc/withTokenBalance'
import withWallet from 'hoc/withWallet'
import withCreatorConfig from 'hoc/withCreatorConfig'

import PageTitle from 'components/PageTitle'

import UnitListing from './listing-types/UnitListing/UnitListing'

import ChooseListingType from './ChooseListingType'
import Step2 from './Step2'
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
        __typename: 'UnitListing',
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

        // HomeShare fields:
        weekendPrice: '',
        booked: [],
        customPricing: [],
        unavailable: [],

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
    return (
      <div className="container create-listing">
        <PageTitle>Add a Listing</PageTitle>
        <Switch>
          <Route
            path="/create/details"
            render={({match}) => (
              <UnitListing
                listing={this.state.listing}
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
{/*}
          <Route
            path="/create/step-2"
            render={() => (
              <Step2
                listing={this.state.listing}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
          <Route
            path="/create/boost"
            render={() => (
              <Boost
                listing={this.state.listing}
                tokenBalance={this.props.tokenBalance}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
          <Route
            path="/create/review"
            render={() => (
              <Review
                tokenBalance={this.props.tokenBalance}
                listing={this.state.listing}
              />
            )}
          />
          <Route
            path="/create/availability"
            render={() => (
              <Availability
                tokenBalance={this.props.tokenBalance}
                listing={this.state.listing}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
          <Route
            render={() => (
              <ChooseListingType
                listing={this.state.listing}
                onChange={listing => this.setListing(listing)}
              />
            )}
          />
*/}
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
