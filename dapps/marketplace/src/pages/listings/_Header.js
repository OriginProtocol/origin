import React from 'react'
import { fbt } from 'fbt-runtime'

const ListingsHeader = ({ isSearch, totalCount, showCount, search }) => {
  if (!showCount) {
    return null
  }

  if (!isSearch) {
    return (
      <fbt desc="Num Listings">
        <fbt:plural count={totalCount} showCount="yes">
          Listing
        </fbt:plural>
      </fbt>
    )
  }

  if (search.ognListings) {
    return (
      <fbt desc="NumOgnRewardsResult">
        <fbt:param name="count">{totalCount}</fbt:param>{' '}
        <fbt:plural count={totalCount} showCount="no">
          Listing
        </fbt:plural>
        with Origin Rewards
      </fbt>
    )
  }

  return (
    <fbt desc="NumResults">
      <fbt:plural count={totalCount} showCount="yes">
        result
      </fbt:plural>
    </fbt>
  )
}

export default ListingsHeader
