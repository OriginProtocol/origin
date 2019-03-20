import React from 'react'

const ListingPic = ({ listing }) => (
  <div className="main-pic-wrap">
    {listing.media && listing.media.length ? (
      <div
        className="main-pic"
        style={{
          backgroundImage: `url(${listing.media[0].urlExpanded})`
        }}
      />
    ) : (
      <div className="main-pic empty" />
    )}
  </div>
)

export default ListingPic
