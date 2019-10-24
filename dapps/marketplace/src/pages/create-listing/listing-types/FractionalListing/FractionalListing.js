import React from 'react'

import Steps from '../Steps'
import TitleDescription from '../../TitleDescription'
import Pricing from './Pricing'
import Availability from './Availability'
import Location from './Location'
import LocationObfuscation from './LocationObfuscation'
import Images from '../../Images'
import Review from './Review'

const FractionalListing = props => {
  const isHausing = props.listing.subCategory === 'schema.housing' 

  const steps = [
    { step: 1, component: TitleDescription, require: 'subCategory' },
    { step: 2, component: Pricing, path: 'pricing', require: 'quantity' },
    {
      step: 3,
      component: Availability,
      path: 'availability',
      require: 'title'
    }
  ]
  if (isHausing) {
    steps.push({ step: 4, component: Location, path: 'location' })
    steps.push({ step: 5, component: LocationObfuscation, path: 'locationObfuscate' })
  }

  steps.push({ step: isHausing ? 6 : 4, component: Images, path: 'images', require: 'price' })
  steps.push({ step: isHausing ? 7 : 5, component: Review, path: 'review' })

  return (
    <Steps
      {...props}
      steps={steps}
    />
  )
}

export default FractionalListing
