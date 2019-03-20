import React from 'react'

const OfferStatus = ({ offer }) => {
  const classNames = ['status']
  if (offer.status === 0) {
    classNames.push('text-danger')
  } else if (offer.status === 1 || offer.status === 2) {
    classNames.push('pending')
  }
  return <div className={classNames.join(' ')}>{offer.statusStr}</div>
}

export default OfferStatus
