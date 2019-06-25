import React, { useState } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'
import Categories from '@origin/graphql/src/constants/Categories'

import Link from 'components/Link'
import Redirect from 'components/Redirect'

const ListingDetails = ({ listing, prev, next, onChange }) => {
  const [valid, setValid] = useState(false)

  if (!categoryId) {
    return <Redirect to={prev} />
  }
  if (valid) {
    return <Redirect to={next} />
  }

  return (
    <>
      <h1>
        <Link to={prev} className="back d-md-none" />
        Listing Details
      </h1>

      <div className="row">
        <div className="col-md-8">
          <div className="choose-sub-category" />
        </div>
        <div className="col-md-4">
          <div className="gray-box" />
        </div>
      </div>
    </>
  )
}

export default ListingDetails

require('react-styl')(`
`)
