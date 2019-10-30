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
  const isHousing = props.listing.subCategory === 'schema.housing'
  let counter = 1
  const steps = [
    { step: counter++, component: TitleDescription, require: 'subCategory' },
    {
      step: counter++,
      component: Pricing,
      path: 'pricing',
      require: 'quantity'
    },
    {
      step: counter++,
      component: Availability,
      path: 'availability',
      require: 'title'
    }
  ]
  if (isHousing) {
    steps.push({ step: counter++, component: Location, path: 'location' })
    steps.push({
      step: counter++,
      component: LocationObfuscation,
      path: 'locationObfuscate'
    })
  }

  steps.push({
    step: counter++,
    component: Images,
    path: 'images',
    require: 'price'
  })
  steps.push({ step: counter++, component: Review, path: 'review' })

  return <Steps {...props} steps={steps} />
}

export default FractionalListing
