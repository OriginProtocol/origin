import React from 'react'
import { withRouter } from 'react-router-dom'
import formatDate from 'utils/formatDate'
import { getIpfsGateway } from 'utils/config'

import { Icon, Card, Spinner } from '@blueprintjs/core'

import Price from 'components/Price2'
import Identity from 'components/Identity'

function status(listing) {
  if (listing.status === 'sold') {
    return <div className="ribbon">Sold</div>
  } else if (listing.status === 'withdrawn') {
    return <div className="ribbon withdrawn">Withdrawn</div>
  }
}

const Listings = ({ listings, history, hasNextPage }) => {
  if (!listings) return null
  const ipfsGateway = getIpfsGateway()
  return (
    <div className="mt-3 listings-grid">
      {listings.map(a => (
        <Card
          interactive={true}
          key={a.id}
          onClick={() => history.push(`/marketplace/listings/${a.id}`)}
          className="listing-card"
        >
          <h5 className="bp3-heading ellip" style={{ maxWidth: 'none' }}>
            {a.hidden ? <Icon icon="eye-off" className="mr-2" /> : null}
            {a.featured ? <Icon icon="clean" className="mr-2" /> : null}
            {a.title}
          </h5>
          {status(a)}
          {a.media && a.media.length ? (
            <div
              className="main-pic"
              style={{
                backgroundImage: `url(${ipfsGateway}/${a.media[0].url.replace(
                  ':/',
                  ''
                )})`
              }}
            />
          ) : null}
          <div className="price">
            <Price price={a.price} />
            {a.seller ? <Identity account={a.seller.id} /> : ''}
          </div>
          <div className="info">
            {`#${a.id}`}
            {a.createdEvent
              ? ` created ${formatDate(a.createdEvent.timestamp)}`
              : ''}
          </div>
        </Card>
      ))}
      {!hasNextPage ? null : (
        <Card className="listing-card">
          <h5 className="bp3-heading bp3-skeleton">New Listing</h5>
          <div
            className="main-pic"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <Spinner />
          </div>
          <div className="price bp3-skeleton">Price</div>
          <div className="info bp3-skeleton">Info</div>
        </Card>
      )}
    </div>
  )
}

export default withRouter(Listings)

require('react-styl')(`
  .listings-grid
    display: grid
    grid-column-gap: 20px;
    grid-row-gap: 20px;
    grid-template-columns: repeat(auto-fill,minmax(265px, 1fr));
  .listing-card
    position: relative
    overflow: hidden
    display: flex;
    flex-direction: column;
    justify-content: center;
    .ribbon
      position: absolute;
      background: #2989D8;
      font-weight: bold;
      color: #fff
      line-height: 18px;
      width: 100px;
      text-align: center;
      top: 20px;
      right: -22px;
      transform: rotate(45deg);
      text-transform: uppercase;
      font-size: 10px;
      &.withdrawn
        background: #F70505
    .main-pic
      height: 160px
      background-size: contain
      background-repeat: no-repeat
      background-position: center
      margin-bottom: 2px
    .price
      margin-top: 0.5rem
      display: flex
      justify-content: space-between
    .info
      margin-top: 0.5rem
      color: #666
      font-size: 0.9rem
`)
