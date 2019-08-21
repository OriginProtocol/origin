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
        <div className="row mt-4 mb-4">
          <div className="col">
            <strong>Purchase Date</strong>
          </div>
          <div className="col">{grant.purchaseDate}</div>
        </div>
        <div className="row mb-4">
          <div className="col">
            <strong>Purchase Round</strong>
          </div>
          <div className="col">{grant.purchaseRound}</div>
        </div>
        <div className="row mb-4">
          <div className="col">
            <strong>Total Purchase</strong>
          </div>
          <div className="col">{grant.purchaseTotal}</div>
        </div>
        <div className="row mb-4">
          <div className="col">
            <strong>Investment Amount</strong>
          </div>
          <div className="col">{grant.investmentAmount}</div>
        </div>
      </div>
    )
  })

  return (
    <>
      <div className="row">
        <div className="col">
          <h2 className="mb-4">Investment Details</h2>
        </div>
      </div>
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
