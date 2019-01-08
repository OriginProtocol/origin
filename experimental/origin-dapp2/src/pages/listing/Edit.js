import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import pick from 'lodash/pick'

import Step1 from '../create-listing/Step1'
import Step2 from '../create-listing/Step2'
import Step3 from '../create-listing/Step3'
import Review from '../create-listing/Review'

class EditListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listing: {
        ...pick(props.listing, [
          'title',
          'description',
          'category',
          'subCategory'
        ]),
        quantity: String(props.listing.unitsTotal),
        price: String(props.listing.price.amount),
        boost: '0',
        media: props.listing.media.map(m => pick(m, 'contentType', 'url'))
      }
    }
  }

  render() {
    const stepProps = {
      listing: this.state.listing,
      listingId: this.props.listing.id,
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
            path="/listings/:listingID/edit/step-3"
            render={() => <Step3 {...stepProps} />}
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
