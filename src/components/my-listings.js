import React, { Component } from 'react'
import { connect } from 'react-redux'
import MyListingCard from './my-listing-card'

import { storeWeb3Intent } from '../actions/App'
import origin from '../services/origin'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.handleUpdate = this.handleUpdate.bind(this)
    this.loadListing = this.loadListing.bind(this)
    this.state = {
      filter: 'all',
      listings: [],
      loading: true,
    }
  }

  componentDidMount() {
    if(!web3.givenProvider || !this.props.web3Account) {
      this.props.storeWeb3Intent('view your listings')
    }
  }

  /*
  * WARNING: These functions don't actually return what they might imply.
  * They use return statements to chain together async calls. Oops.
  *
  * For now, we mock a getBySellerAddress request by fetching all
  * listings individually, filtering each by sellerAddress.
  */

  async getListingIds() {
    try {
      const ids = await origin.listings.allIds()

      return await Promise.all(ids.map(this.loadListing))
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      if (listing.sellerAddress === this.props.web3Account) {
        const listings = [...this.state.listings, listing]

        this.setState({ listings })
      }

      return listing
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async componentWillMount() {
    await this.getListingIds()

    this.setState({ loading: false })
  }

  async handleUpdate(address) {
    try {
      const listing = await origin.listings.get(address)
      const listings = [...this.state.listings]
      const index = listings.findIndex(l => l.address === address)

      listings[index] = listing

      this.setState({ listings })
    } catch(error) {
      console.error(`Error handling update for listing: ${address}`)
    }
  }

  render() {
    const { filter, listings, loading } = this.state
    const filteredListings = (() => {
      switch(filter) {
        case 'active':
          return listings.filter(l => l.unitsAvailable)
        case 'inactive':
          return listings.filter(l => !l.unitsAvailable)
        default:
          return listings
      }
    })()

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              {loading && 
                <div>
                  <h1>Loading...</h1>
                </div>
              }
            </div>
          </div>
          <div className="row">
            <div className="col-12 text-center">
              {!loading && !listings.length &&
                     <div>
                  <img src="images/empty-listings-graphic.svg"></img>
                  <h1>You don't have any listings yet.</h1>
                  <p className="lead">Follow the steps below to create your first listing!</p>
                  <br></br>
                  <br></br>
                  <div className="row">
                    <div className="col-12 col-sm-4 col-xl-2 offset-xl-3 text-center">
                      <div className="numberCircle"><h1 className="circle-text">1</h1></div>
                      <p>Click the + button in the top right to get started</p>
                    </div>
                    <div className="col-12 col-sm-4 col-xl-2 text-center">
                      <div className="numberCircle"><h1 className="circle-text">2</h1></div>
                      <p>Write a name and a description and set a price for your listing</p>
                    </div>
                    <div className="col-12 col-sm-4 col-xl-2 text-center">
                      <div className="numberCircle"><h1 className="circle-text">3</h1></div>
                      <p>Upload photos to make your listings look professional and stand out</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 text-center">
                      <br></br>
                      <br></br>
                      <a href="#/create" className="btn btn-lrg btn-primary btn-auto-width">Create Your First Listing</a>
                    </div>
                  </div> 
                </div> 
              }
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-3">
              {!loading && !!listings.length &&
                <div className="filters list-group flex-row flex-md-column">
                  <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>All</a>
                  <a className={`list-group-item list-group-item-action${filter === 'active' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'active' })}>Active</a>
                  <a className={`list-group-item list-group-item-action${filter === 'inactive' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'inactive' })}>Inactive</a>
                </div>
              }
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {filteredListings.map(l => <MyListingCard key={`my-listing-${l.address}`} listing={l} handleUpdate={this.handleUpdate} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent,
  }
}

const mapDispatchToProps = dispatch => ({
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent)),
})

export default connect(mapStateToProps, mapDispatchToProps)(MyListings)
