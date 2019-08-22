import React from 'react'
import { fbt } from 'fbt-runtime'

const ListingsHeader = ({ isSearch, totalCount, showCount }) => {
  if (!showCount) {
    return null
  }
  let className = 'listings-count'
  let content = (
    <fbt desc="Num Listings">
      <fbt:plural count={totalCount} showCount="yes">
        Listing
      </fbt:plural>
    </fbt>
  )

  if (isSearch) {
    className += ' search-results'
    if (this.state.search.ognListings) {
      content = (
        <fbt desc="NumOgnRewardsResult">
          <fbt:param name="count">{totalCount}</fbt:param>{' '}
          <fbt:plural count={totalCount} showCount="no">
            Listing
          </fbt:plural>
          with Origin Rewards
        </fbt>
      )
    } else {
      content = (
        <fbt desc="NumResults">
          <fbt:plural count={totalCount} showCount="yes">
            result
          </fbt:plural>
        </fbt>
      )
    }
  }
  return <h5 className={className}>{content}</h5>
}

export default ListingsHeader

require('react-styl')(`
  .listings-count
    font-family: var(--heading-font)
    font-size: 40px
    font-weight: 200
    color: var(--dark)

  @media (max-width: 767.98px)
    .listings-count
      margin: 0
      font-size: 32px
      &.search-results
        font-size: 14px
        font-weight: normal
      &.category-filter
        font-size: 28px
`)
