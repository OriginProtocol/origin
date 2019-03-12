import React from 'react'

import Steps from '../Steps'
import Details from './Details'
import Boost from './Boost'
import Availability from './Availability'
import Review from './Review'


const FractionalHourlyListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: Details, require: 'subCategory' },
      { step: 2, component: Availability, path: 'availability' },
      { step: 3, component: Boost, path: 'boost', require: 'title' },
      { step: 4, component: Review, path: 'review' }
    ]}
  />
)

export default FractionalHourlyListing
