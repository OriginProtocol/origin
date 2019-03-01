import React from 'react'

const ListingBadge = ({ status, featured }) => {
  if (status === 'sold' || status === 'unavailable' || status === 'pending') {
    return <div className={`badge badge-${status}`}>{status}</div>
  }
  if (status === 'soldout') {
    return <div className="badge badge-soldout">sold out</div>
  }
  if (featured) {
    return <div className="badge badge-featured">featured</div>
  }

  return null
}

export default ListingBadge

require('react-styl')(`
  .badge
    &-sold
      background: var(--dark)
      color: white

    &-unavailable
      background: var(--dark)
      color: white

    &-soldout
      background: var(--dark)
      color: white

    &-pending
      background: var(--dark)
      color: white

    &-featured
      background: var(--gold)
      color: white
`)
