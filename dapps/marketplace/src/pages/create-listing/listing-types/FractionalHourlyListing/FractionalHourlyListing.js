import React from 'react'

import Steps from '../Steps'
import Details from './Details'
import Boost from './Boost'
import Availability from './Availability'
import Review from './Review'
import withWallet from '../../../../hoc/withWallet'

const FractionalHourlyListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: Details, require: 'subCategory' },
      {
        step: 2,
        component: withWallet(Boost),
        path: 'boost',
        require: 'title'
      },
      { step: 3, component: Availability, path: 'availability' },
      { step: 4, component: Review, path: 'review' }
    ]}
  />
)

export default FractionalHourlyListing
