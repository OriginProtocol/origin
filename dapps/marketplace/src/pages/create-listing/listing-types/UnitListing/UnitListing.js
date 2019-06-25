import React from 'react'

import Steps from '../Steps'
import TitleDescription from '../../TitleDescription'
import Quantity from '../../Quantity'
import Pricing from './Pricing'
import Images from '../../Images'
// import Boost from './Boost'
import Review from './Review'

const UnitListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: TitleDescription, require: 'subCategory' },
      { step: 2, component: Quantity, path: 'quantity', require: 'title' },
      { step: 3, component: Pricing, path: 'pricing', require: 'quantity' },
      { step: 4, component: Images, path: 'images', require: 'price' },
      // { step: 2, component: Boost, path: 'boost', require: 'title' },
      { step: 5, component: Review, path: 'review' }
    ]}
  />
)

export default UnitListing
