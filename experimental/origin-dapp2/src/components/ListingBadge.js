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
    background: gray
    color: white

    &-sold
      background: var(--dark)

    &-unavailable
      background: var(--dark)

    &-soldout
      background: var(--dark)

    &-pending
      background: var(--dark)

    &-featured
      background: var(--gold)
`)
