import React from 'react'

import get from 'lodash/get'

const ListingPic = ({ listing }) => {
  const pic = get(listing, 'media[0].urlExpanded')
  if (!pic) {
    return (
      <div className="pic">
        <div className="main-pic empty" />
      </div>
    )
  }

  return (
    <div className="pic">
      <div
        className="main-pic"
        style={{
          backgroundImage: `url(${listing.media[0].urlExpanded})`
        }}
      />
    </div>
  )
}

export default ListingPic
