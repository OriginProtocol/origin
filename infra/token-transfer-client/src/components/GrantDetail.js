import React from 'react'

import Swiper from 'react-id-swiper'
import 'react-id-swiper/lib/styles/css/swiper.css'

const GrantDetail = props => {
  const swiperParams = {
    autoHeight: true,
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  }

  const details = props.grants.map(grant => {
    return (
      <div key={grant.id}>
        <div className="row mt-4 mb-2">
          <div className="col">
            <strong>Purchase Date</strong>
          </div>
          <div className="col text-right">{grant.purchaseDate}</div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <strong>Purchase Round</strong>
          </div>
          <div className="col text-right">{grant.purchaseRound}</div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <strong>Total Purchase</strong>
          </div>
          <div className="col text-right">{grant.purchaseTotal}</div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <strong>Investment Amount</strong>
          </div>
          <div className="col text-right">
            {Number(grant.investmentAmount).toLocaleString()}
          </div>
        </div>
      </div>
    )
  })

  return (
    <>
      <h2 className="mb-2">Investment Details</h2>
      <div className="table-card" style={{ fontSize: '14px' }}>
        {details.length > 1 ? (
          <Swiper {...swiperParams}>{details}</Swiper>
        ) : (
          details
        )}
      </div>
    </>
  )
}

export default GrantDetail
