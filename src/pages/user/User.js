import React, { Component } from 'react'
import { connect } from 'react-redux'
import { fetchUser } from 'actions/User'
import Avatar from 'components/avatar'
import Review from 'components/review'

import origin from '../../services/origin'

class User extends Component {
  constructor(props) {
    super(props)

    this.state = { reviews: [] }
  }

  async mapPurchaseLengths(listing) {
    try {
      const len = await origin.listings.purchasesLength(listing.address)

      return { ...listing, len }
    } catch(error) {
      console.error(`Error fetching purchases length for listing: ${listing.address}`)
    }
  }

  async loadListing(id) {
    try {
      return await origin.listings.getByIndex(id)
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async fetchListings() {
    try {
      const ids = await origin.listings.allIds()

      return await Promise.all(ids.map(this.loadListing))
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  async getPurchaseAddress(addr, i) {
    try {
      return await origin.listings.purchaseAddressByIndex(addr, i)
    } catch(error) {
      console.error(`Error fetching purchase address at: ${i}`)
    }
  }

  async getAllReviews() {
    const listings = await this.fetchListings()
    const purchaseMaps = await Promise.all(
      listings.map(this.mapPurchaseLengths)
    )
    const purchaseAddresses = await Promise.all(
      purchaseMaps.filter(l => l.len).map(({ address, len }) => {
        return Promise.all(
          [...Array(len).keys()].map(i => this.getPurchaseAddress(address, i))
        )
      })
    )
    const flattenedAddressArray = [].concat(...purchaseAddresses)
    const reviews = await Promise.all(
      flattenedAddressArray.map(purchaseAddress => origin.reviews.find({ purchaseAddress }))
    )
    const flattenedReviews = [].concat(...reviews)
    console.log('Reviews:', flattenedReviews)
    this.setState({ reviews: flattenedReviews })
  }

  async componentWillMount() {
    this.props.fetchUser(this.props.userAddress)

    this.getAllReviews()
  }

  render() {
    const { address, fullName, profile, attestations } = this.props.user
    const description = (profile && profile.description) || 'An Origin user without a description'
    const usersReviews = this.state.reviews.filter(r => r.revieweeAddress === address)

    return (
      <div className="public-user profile-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              <Avatar image={profile && profile.avatar} className="primary" placeholderStyle="purple" />
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="name d-flex">
                <h1>{fullName}</h1>
              </div>
              <p>{description}</p>
            </div>
            <div className="col-12 col-sm-4 col-md-3 col-lg-2">
              {attestations && !!attestations.length &&
                <div className="verifications-box">
                  <h3>Verified Info</h3>
                  {/* need to know how to verify signature instead of just finding object by key */}
                  {attestations.find(a => a.service === 'phone') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="phone verified icon" />
                      <div>Phone</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'email') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="email verified icon" />
                      <div>Email</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'facebook') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="Facebook verified icon" />
                      <div>Facebook</div>
                    </div>
                  }
                  {attestations.find(a => a.service === 'twitter') &&
                    <div className="service d-flex">
                      <img src="images/phone-icon-verified.svg" alt="Twitter verified icon" />
                      <div>Twitter</div>
                    </div>
                  }
                </div>
              }
            </div>
            <div className="col-12 col-sm-8 col-md-9 col-lg-10">
              <div className="reviews">
                <h2>Reviews <span className="review-count">{Number(usersReviews.length).toLocaleString()}</span></h2>
                {usersReviews.map(r => <Review key={r.transactionHash} review={r} />)}
                {/* To Do: pagination */}
                {/* <a href="#" className="reviews-link">Read More<img src="/images/carat-blue.svg" className="down carat" alt="down carat" /></a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, { userAddress }) => {
  return {
    user: state.users.find(u => u.address === userAddress) || {},
  }
}

const mapDispatchToProps = dispatch => ({
  fetchUser: address => dispatch(fetchUser(address))
})

export default connect(mapStateToProps, mapDispatchToProps)(User)
