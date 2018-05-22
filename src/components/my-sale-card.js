import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import { fetchUser } from 'actions/User'
import Timelapse from './timelapse'
import TransactionProgress from './transaction-progress'

class MySaleCard extends Component {
  componentWillMount() {
    this.props.fetchUser(this.props.purchase.buyerAddress)
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { listing, purchase, user } = this.props

    if (!listing) {
      console.error(`Listing not found for purchase ${purchase.address}`)
      return null
    }

    const { name, pictures } = listing
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]
    const buyerName = (user && user.profile && `${user.profile.firstName} ${user.profile.lastName}`) || 'Unnamed User'
    const price = `${Number(listing.price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH` // change to priceEth
    const soldAt = purchase.created * 1000 // convert seconds since epoch to ms

    let step

    if (purchase.stage === 'complete') {
      step = 4
    } else if (purchase.stage === 'seller_pending') {
      step = 3
    } else if (purchase.stage === 'buyer_pending') {
      step = 2
    } else if (purchase.stage === 'shipping_pending') {
      step = 1
    } else {
      step = 0
    }

    return (
      <div className="sale card">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row">
            <div className="transaction order-3 order-lg-1">
              <h2 className="title"><Link to={`/purchases/${purchase.address}`}>{name}</Link></h2>
              <h2 className="title">sold to <Link to={`/users/${user.address}`}>{buyerName}</Link></h2>
              <p className="address text-muted">{user.address}</p>
              <div className="d-flex">
                <p className="price">Price: {price}</p>
                {/* Not Yet Relevant */}
                {/*<p className="quantity">Quantity: {quantity.toLocaleString()}</p>*/}
              </div>
            </div>
            <div className="timestamp-container order-2 text-muted text-right">
              <p className="timestamp"><Timelapse reactive={false} reference={soldAt} /></p>
            </div>
            <div className="aspect-ratio order-1 order-lg-3">
              <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
                <img src={photo || 'images/default-image.svg'} role="presentation" />
              </div>
            </div>
          </div>
          <TransactionProgress currentStep={step} purchase={purchase} perspective="seller" subdued="true" />
          <div className="d-flex justify-content-between actions">
            {step === 1 && <p><strong>Next Step:</strong> Send the order to buyer</p>}
            {step === 2 && <p><strong>Next Step:</strong> Wait for buyer to receive order</p>}
            {step === 3 && <p><strong>Next Step:</strong> Withdraw funds</p>}
            {step === 4 && <p>This order is complete</p>}
            <p className="link-container"><Link to={`/purchases/${purchase.address}`}>View Details<img src="images/carat-blue.svg" className="carat" alt="right carat" /></Link></p>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { purchase }) => {
  return {
    user: state.users.find(u => u.address === purchase.buyerAddress) || {},
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(MySaleCard)
