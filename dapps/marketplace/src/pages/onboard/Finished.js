import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import UserProfileCreated from 'components/_UserProfileCreated'

const Finished = ({ linkPrefix, redirectto }) => {
  const continueTo = redirectto ? redirectto : `${linkPrefix}/onboard/back`

  const [finished, setFinished] = useState(false)

  if (finished) {
    return <Redirect to={continueTo} />
  }

  return (
    <div className="finished">
      <UserProfileCreated
        onCompleted={() => {
          setFinished(true)
        }}
      />
    </div>
  )
}

export default Finished

require('react-styl')(`
  .onboard .finished
    max-width: 475px
    margin: 0 auto
`)
