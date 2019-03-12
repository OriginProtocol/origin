<<<<<<< HEAD
import React, { Component } from 'react'

import Redirect from 'components/Redirect'

=======
import React from 'react'

import Steps from '../Steps'
>>>>>>> master
import Details from './Details'
import Boost from './Boost'
import Availability from './Availability'
import Review from './Review'

<<<<<<< HEAD
class FractionalListing extends Component {
  constructor(props) {
    super(props)
    this.state = {
      step: this.props.step ? parseInt(this.props.step) : 1
    }
    if (this.props.onChange) {
      this.props.onChange({
        // FractionalListing specific fields
        weekendPrice: '',
        booked: [],
        customPricing: [],
        unavailable: [],
        ...this.props.listing
      })
    }
  }

  render() {
    const steps = 3
    switch (this.state.step) {
      case 0:
        return <Redirect to={`/create/new`} />
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
          <Availability
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
          <Boost
            listing={this.props.listing}
            steps={steps}
            step={3}
            tokenBalance={this.props.tokenBalance}
            onPrev={() => this.setState({ step: 2 })}
            onNext={() => this.setState({ step: 4 })}
            onChange={listing => this.props.onChange(listing)}
          />
        )
      case 4:
        return (
          <Review
            listing={this.props.listing}
            steps={steps}
            step={4}
            tokenBalance={this.props.tokenBalance}
            onPrev={() => this.setState({ step: 3 })}
            onNext={() => this.setState({ step: 5 })}
            onChange={listing => this.props.onChange(listing)}
          />
        )
      default:
        return <div>Something went wrong</div>
    }
  }
}
=======
const FractionalListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: Details, require: 'subCategory' },
      { step: 2, component: Boost, path: 'boost', require: 'title' },
      { step: 3, component: Availability, path: 'availability' },
      { step: 4, component: Review, path: 'review' }
    ]}
  />
)
>>>>>>> master

export default FractionalListing
