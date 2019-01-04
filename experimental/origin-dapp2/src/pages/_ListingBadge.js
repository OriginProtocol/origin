import React from 'react'

const ListingBadge = ({ status, featured }) => {
  if (status === 'sold') {
    return <div className="badge badge--sold">sold</div>
  }
  // TODO: Unavailable (multi unit, pending)
  // TODO: Pending (single unit, pending)
  // TODO: Sold Out (multi unit, no units)
  if (featured) {
    return <div className="badge badge--featured">featured</div>
  }

  return null
}

export default ListingBadge

require('react-styl')(`
  .badge
    background: gray
    color: white

    &--sold
      background: var(--greenblue)

    &--unavailable
      background: var(--dark-blue-grey)

    &--sold-out
      background: var(--dusk)

    &--pending
      background: var(--dark-purple)

    &--featured
      background: var(--gold)
`)
