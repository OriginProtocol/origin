import React from 'react'

const Exposure = ({ listing }) => {
  let exposure = 'Low'
  if (listing.commissionPerUnit >= 66) {
    exposure = 'High'
  } else if (listing.commissionPerUnit >= 33) {
    exposure = 'Medium'
  }
  return <span className="badge badge-primary">{exposure}</span>
}

export default Exposure
