import React, { Component } from 'react'

import Gallery from 'components/Gallery'
import Buy from './Buy'

class ListingDetail extends Component {
  render() {
    const { listing, quantity, from } = this.props
    const amount = String(Number(listing.price.amount) * Number(quantity))

    return (
      <div className="listing-detail">
        <div className="category">{listing.categoryStr}</div>
        <h2>{listing.title}</h2>
        <div className="row">
          <div className="col-md-8">
            <Gallery pics={listing.media} />
            <div className="description">{listing.description}</div>
          </div>
          <div className="col-md-4">
            <div className="listing-buy">
              <div className="price">
                {`${listing.price.amount} ETH`}
                <span>{` / each`}</span>
              </div>
              <div className="quantity">
                <span>Quantity</span>
                <span>
                  <select
                    value={quantity}
                    onChange={e => this.props.updateQuantity(e.target.value)}
                  >
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                    <option>4</option>
                    <option>5</option>
                  </select>
                </span>
              </div>
              <div className="total">
                <span>Total Price</span>
                <span>{`${amount} ETH`}</span>
              </div>
              <Buy listing={listing} from={from} value={amount} />
            </div>
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

    .category
      font-family: Lato
      font-size: 14px
      color: var(--dusk)
      font-weight: normal
      text-transform: uppercase
      margin-top: 0.75rem

    .main-pic
      padding-top: 56.6%
      background-size: contain
      background-repeat: no-repeat
      background-position: top center

    .description
      margin-top: 2rem

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
        border-bottom: 1px solid var(--light)
        padding: 0.2rem 0 1.5rem 2rem
        line-height: 1rem
        font-family: Lato
        font-size: 24px
        font-weight: bold
        font-style: normal
        color: #000000
        > span
          font-weight: normal

`)
