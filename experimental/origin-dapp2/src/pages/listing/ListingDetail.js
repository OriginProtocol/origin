import React, { Component } from 'react'

import Gallery from 'components/Gallery'
import Link from 'components/Link'
import Reviews from 'components/Reviews'
import AboutParty from 'components/AboutParty'
import ListingBadge from 'components/ListingBadge'

import Buy from './mutations/Buy'
import category from 'utils/category'

const SelectQuantity = ({ quantity, onChange, available }) => {
  return (
    <div className="quantity">
      <span>Quantity</span>
      <span>
        <select value={quantity} onChange={e => onChange(e.target.value)}>
          {Array(available)
            .fill(0)
            .map((v, idx) => (
              <option key={idx}>{idx + 1}</option>
            ))}
        </select>
      </span>
    </div>
  )
}

const Sold = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Sold</div>
    <div>
      This listing is sold out. Try visiting the listings page and searching for
      something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

const Pending = () => (
  <div className="listing-buy pending">
    <div>This listing is</div>
    <div>Pending</div>
    <div>
      Another buyer has already made an offer on this listing. Try visiting the
      listings page and searching for something similar.
    </div>
    <Link to="/listings">View Listings</Link>
  </div>
)

const SingleUnit = ({ listing, from }) => (
  <div className="listing-buy">
    <div className="price">{`${listing.price.amount} ETH`}</div>
    <Buy
      listing={listing}
      from={from}
      value={listing.price.amount}
      quantity={1}
      className="btn btn-primary"
      children="Buy Now"
    />
  </div>
)

const MultiUnit = ({ listing, from, quantity, updateQuantity }) => {
  const amount = String(Number(listing.price.amount) * Number(quantity))
  return (
    <div className="listing-buy multi">
      <div className="price">
        {`${listing.price.amount} ETH`}
        {listing.multiUnit ? <span>{` / each`}</span> : null}
      </div>
      <SelectQuantity
        quantity={quantity}
        onChange={val => updateQuantity(val)}
        available={listing.unitsAvailable}
      />
      <div className="total">
        <span>Total Price</span>
        <span>{`${amount} ETH`}</span>
      </div>
      <Buy
        listing={listing}
        from={from}
        value={amount}
        quantity={quantity}
        className="btn btn-primary"
        children="Buy Now"
      />
    </div>
  )
}

const ForSeller = ({ listing }) => (
  <div className="listing-buy">
    <div className="price">{`${listing.price.amount} ETH`}</div>
    <Link
      className="btn btn-primary mt-2"
      to={`/listings/${listing.id}/edit`}
      children={'Edit Listing'}
    />
  </div>
)

class ListingDetail extends Component {
  state = {}
  render() {
    const { listing } = this.props
    const sold = listing.unitsSold >= listing.unitsTotal
    const pending = listing.unitsAvailable <= 0

    return (
      <div className="listing-detail">
        <div className="header">
          <div className="category">{category(listing)}</div>
          <ListingBadge status={listing.status} featured={listing.featured} />
        </div>
        <h2>{listing.title}</h2>
        <div className="row">
          <div className="col-md-8">
            <Gallery pics={listing.media} />
            <div className="description">{listing.description}</div>
            <hr />
            <Reviews id={listing.seller.id} />
          </div>
          <div className="col-md-4">
            {listing.seller.id === this.props.from ? (
              <ForSeller {...this.props} />
            ) : sold ? (
              <Sold />
            ) : pending ? (
              <Pending />
            ) : listing.multiUnit ? (
              <MultiUnit {...this.props} />
            ) : (
              <SingleUnit {...this.props} />
            )}

            <h5 className="mt-3">About the Seller</h5>
            <AboutParty id={listing.seller.id} />
          </div>
        </div>
      </div>
    )
  }
}

export default ListingDetail

require('react-styl')(`
  .listing-detail
    margin-top: 2.5rem

    h2
      font-family: Poppins
      font-size: 40px
      font-weight: 200
      font-style: normal
      color: var(--dark)

    .header
      display: flex
      align-items: center
      justify-content: space-between

    .category
      font-family: Lato
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem

    .badge
      margin-top: 0.75rem

    .main-pic
      padding-top: 56.6%
      background-size: contain
      background-repeat: no-repeat
      background-position: top center

    .description
      margin-top: 2rem
      white-space: pre-wrap

    .listing-buy
      padding: 1.5rem
      border-radius: 5px;
      background-color: var(--pale-grey-eight)
      > .btn
        border-radius: 2rem
        padding: 0.5rem 1rem
        width: 100%
      .quantity,.total
        padding: 1rem
        font-family: Lato
        font-size: 18px
        font-weight: normal
        display: flex
        justify-content: space-between
      .total
        padding-top: 0
      .price
        background: url(images/eth-icon.svg) no-repeat
        background-size: 1.5rem
        padding: 0.2rem 0 1.5rem 2rem
        line-height: 1rem
        font-family: Lato
        font-size: 24px
        font-weight: bold
        font-style: normal
        color: #000000
        > span
          font-weight: normal
      &.multi .price
        border-bottom: 1px solid var(--light)
      &.pending
        text-align: center
        font-weight: normal
        > div:nth-child(2)
          font-size: 24px;
          margin: 1rem 0;
        > div:nth-child(3)
          margin-bottom: 1rem

`)
