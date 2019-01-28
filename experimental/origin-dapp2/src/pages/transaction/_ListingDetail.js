import React from 'react'

const ListingDetail = ({ listing }) => (
  <div className="tx-listing-detail">{listing.title}</div>
)

export default ListingDetail

require('react-styl')(`
  .tx-listing-detail
    border: 1px solid var(--light)
    border-radius: 5px
    padding: 1rem
`)
