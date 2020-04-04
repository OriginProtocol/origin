import React from 'react'
import moment from 'moment'
import get from 'lodash.get'

import Swiper from 'react-id-swiper'
import 'swiper/css/swiper.css'

const GrantDetail = ({ grants, user }) => {
  const swiperParams = {
    autoHeight: true,
    slidesPerView: 1,
    pagination: {
      el: '.swiper-pagination',
      type: 'bullets',
      clickable: true
    }
  }

  const details = grants.map(grant => {
    return (
      <div key={grant.id}>
        <div className="row mt-4 mb-2">
          <div className="col">
            <span className="text-muted">Investor</span>
          </div>
          <div className="col font-weight-bold text-right">
            {get(user, 'name', '')}
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <span className="text-muted">Purchase Date</span>
          </div>
          {grant.purchaseDate && (
            <div className="col font-weigbt-bold text-right">
              {moment(grant.purchaseDate)
                .utc()
                .format('LL')}
            </div>
          )}
        </div>
        <div className="row mb-2">
          <div className="col">
            <span className="text-muted">Purchase Round</span>
          </div>
          <div className="col font-weight-bold text-right">
            {grant.purchaseRound}
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <span className="text-muted">Total Purchase</span>
          </div>
          <div className="col font-weight-bold text-right">
            {Number(grant.amount).toLocaleString()} OGN
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            <span className="text-muted">Investment Amount</span>
          </div>
          <div className="col font-weight-bold  text-right">
            {'$' + Number(grant.investmentAmount).toLocaleString()}
          </div>
        </div>
      </div>
    )
  })

  return (
    <>
      <h2 className="mb-2">Investment Details</h2>
      <div>
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
