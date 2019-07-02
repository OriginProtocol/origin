import React from 'react'

import Steps from '../Steps'
import TitleDescription from '../../TitleDescription'
import Pricing from '../../Pricing'
import Images from '../../Images'
import Review from './Review'

const UnitListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: TitleDescription, require: 'subCategory' },
      { step: 3, component: Pricing, path: 'pricing', require: 'title' },
      { step: 4, component: Images, path: 'images', require: 'price' },
      { step: 5, component: Review, path: 'review' }
    ]}
  />
)

export default UnitListing
