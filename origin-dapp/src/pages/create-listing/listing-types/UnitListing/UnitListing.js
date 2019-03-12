<<<<<<< HEAD
import React, { Component } from 'react'

import Redirect from 'components/Redirect'

=======
import React from 'react'

import Steps from '../Steps'
>>>>>>> master
import Details from './Details'
import Boost from './Boost'
import Review from './Review'

<<<<<<< HEAD
class UnitListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: this.props.step ? parseInt(this.props.step) : 1
    }
    if (this.props.onChange) {
      // Add custom fields for this ListingType
      this.props.onChange({
        // UnitListing specific fields
        quantity: '1',
        price: '',
        ...this.props.listing
      })
    }
  }

  render() {
    const steps = 2
    switch (this.state.step) {
      case 0:
        return <Redirect to={`/create`} />
      case 1:
        return (
          <Details
            listing={this.props.listing}
            steps={steps}
            step={1}
            onPrev={() => this.setState({ step: 0 })}
            onNext={() => this.setState({ step: 2 })}
            onChange={listing => this.props.onChange(listing)}
          />
        )
      case 2:
        return (
          <Boost
            listing={this.props.listing}
            steps={steps}
            step={2}
            tokenBalance={this.props.tokenBalance}
            onPrev={() => this.setState({ step: 1 })}
            onNext={() => this.setState({ step: 3 })}
            onChange={listing => this.props.onChange(listing)}
          />
        )
      case 3:
        return (
          <Review
            listing={this.props.listing}
            steps={steps}
            step={3}
            tokenBalance={this.props.tokenBalance}
            onPrev={() => this.setState({ step: 2 })}
            onNext={() => this.setState({ step: 4 })}
            onChange={listing => this.props.onChange(listing)}
          />
        )
      default:
        return <div>Something went wrong</div>
    }
  }
}
=======
const UnitListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: Details, require: 'subCategory' },
      { step: 2, component: Boost, path: 'boost', require: 'title' },
      { step: 3, component: Review, path: 'review' }
    ]}
  />
)
>>>>>>> master

export default UnitListing
