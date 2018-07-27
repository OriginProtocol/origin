import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { storeWeb3Intent } from 'actions/App'

import MyListingCard from 'components/my-listing-card'
import Modal from 'components/modal'

import origin from '../services/origin'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.handleProcessing = this.handleProcessing.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.loadListing = this.loadListing.bind(this)
    this.state = {
      filter: 'all',
      listings: [],
      loading: true,
      processing: false,
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

  handleProcessing(processing) {
    this.setState({ processing })
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
    const { filter, listings, loading, processing } = this.state
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
          {loading &&
            <div className="row">
              <div className="col-12 text-center">
                <h1>
                  <FormattedMessage
                    id={ 'my-listings.loading' }
                    defaultMessage={ 'Loading...' }
                  />
                </h1> 
              </div>
            </div>
          }  
          {!loading && !listings.length && 
            <div className="row">
              <div className="col-12 text-center">
                <img src="images/empty-listings-graphic.svg"></img>
                <h1>
                  <FormattedMessage
                    id={ 'my-listings.no-listings' }
                    defaultMessage={ 'You don\'t have any listings yet.' }
                  />
                </h1>
                <p>
                  <FormattedMessage
                    id={ 'my-listings.no-listings-steps' }
                    defaultMessage={ 'Follow the steps below to create your first listing!' }
                  />
                </p>
                <br />
                <br />
                <div className="row">
                  <div className="col-12 col-sm-4 col-lg-2 offset-lg-3 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={ 'my-listings.number-one' }
                          defaultMessage={ '1' }
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={ 'my-listings.step-one' }
                        defaultMessage={ 'Choose the right category for your listing.' }
                      />
                    </p>
                  </div>
                  <div className="col-12 col-sm-4 col-lg-2 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={ 'my-listings.number-two ' }
                          defaultMessage={ '2' }
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={ 'my-listings.step-two ' }
                        defaultMessage={ 'Give your listing a name, description, and price.' }
                      />
                    </p>
                  </div>
                  <div className="col-12 col-sm-4 col-lg-2 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={ 'my-listings.number-three ' }
                          defaultMessage={ '3' }
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={ 'my-listings.step-three ' }
                        defaultMessage={ 'Preview your listing and publish it to the blockchain.' }
                      />
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 text-center">
                    <br />
                    <br />
                    <a href="#/create" className="btn btn-lrg btn-primary btn-auto-width">
                      <FormattedMessage
                        id={ 'my-listings.create-listing' }
                        defaultMessage={ 'Create Your First Listing' }
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
          {!loading && !!listings.length &&
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-12">
                    <h1>
                      <FormattedMessage
                        id={ 'my-listings.myListingsHeading' }
                        defaultMessage={ 'My Listings' }
                      />
                    </h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-3"> 
                    <div className="filters list-group flex-row flex-md-column">
                      <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'all' })}>
                        <FormattedMessage
                          id={ 'my-listings.all' }
                          defaultMessage={ 'All' }
                        />
                      </a>
                      <a className={`list-group-item list-group-item-action${filter === 'active' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'active' })}>
                        <FormattedMessage
                          id={ 'my-listings.active' }
                          defaultMessage={ 'Active' }
                        />
                      </a>
                      <a className={`list-group-item list-group-item-action${filter === 'inactive' ? ' active' : ''}`} onClick={() => this.setState({ filter: 'inactive' })}>
                        <FormattedMessage
                          id={ 'my-listings.inactive' }
                          defaultMessage={ 'Inactive' }
                        />
                      </a>
                    </div>
                  </div>
                  <div className="col-12 col-md-9">
                    <div className="my-listings-list">
                      {filteredListings.map(l => (
                        <MyListingCard
                          key={`my-listing-${l.address}`}
                          listing={l}
                          handleProcessing={this.handleProcessing}
                          handleUpdate={this.handleUpdate}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>  
            </div>  
          } 
        </div>
        {processing &&
          <Modal backdrop="static" isOpen={true}>
            <div className="image-container">
              <img src="images/spinner-animation.svg" role="presentation"/>
            </div>
            <FormattedMessage
              id={ 'my-listings.processingUpdate' }
              defaultMessage={ 'Closing your listing' }
            />
            <br />
            <FormattedMessage
              id={ 'my-listings.pleaseStandBy' }
              defaultMessage={ 'Please stand by...' }
            />
          </Modal>
        }
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
