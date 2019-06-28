import React from 'react'

import Steps from '../Steps'
import TitleDescription from '../../TitleDescription'
import Images from '../../Images'
import Review from './Review'

const AnnouncementListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: TitleDescription, require: 'subCategory' },
      { step: 2, component: Images, path: 'images', require: 'price' },
      { step: 3, component: Review, path: 'review' }
    ]}
  />
)

export default AnnouncementListing
