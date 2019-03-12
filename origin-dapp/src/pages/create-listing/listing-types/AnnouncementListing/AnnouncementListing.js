import React from 'react'

import Steps from '../Steps'
import Details from './Details'
import Review from './Review'

const AnnouncementListing = props => (
  <Steps
    {...props}
    steps={[
      { step: 1, component: Details },
      { step: 2, component: Review, path: 'review' }
    ]}
  />
)

export default AnnouncementListing
