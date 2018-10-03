import React, { Component } from 'react'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

import { storeWeb3Intent } from 'actions/App'

import MyListingCard from 'components/my-listing-card'
import { ProviderModal } from 'components/modals/wait-modals'
import { getListing } from 'utils/listing'

import origin from '../services/origin'

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.handleProcessing = this.handleProcessing.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)
    this.refreshListing = this.refreshListing.bind(this)
    this.state = {
      filter: 'all',
      listings: [],
      loading: true,
      processing: false
    }
  }

  componentDidMount() {
    if (this.props.web3Account) {
      this.loadListings()
    } else if (!web3.givenProvider) {
      this.props.storeWeb3Intent('view your listings')
    }
  }

  componentDidUpdate(prevProps) {
    const { web3Account } = this.props

    // on account change
    if (web3Account && web3Account !== prevProps.web3Account) {
      this.loadListings()
    }
  }

  async loadListings() {
    try {
      const ids = await origin.marketplace.getListings({
        idsOnly: true,
        listingsFor: this.props.web3Account
      })
      const listings = await Promise.all(
        ids.map(id => {
          return getListing(id, true)
        })
      )

      this.setState({ listings, loading: false })
    } catch (error) {
      console.error('Error fetching listing ids')
    }
  }

  handleProcessing(processing) {
    this.setState({ processing })
  }

  async handleUpdate(id) {
    try {
      const listing = await getListing(id)
      const listings = [...this.state.listings]
      const index = listings.findIndex(l => l.id === id)

      listings[index] = listing

      this.setState({ listings })
    } catch (error) {
      console.error(`Error handling update for listing: ${id}`)
    }
  }

  async refreshListing(id) {
    try {
      const listing = await getListing(id)

      this.setState({
        listings: [...this.state.listings.filter(l => l.id !== id), listing]
      })
    } catch (error) {
      console.error(`Error refreshing listing: ${id}`)
    }
  }

  render() {
    const { filter, listings, loading, processing } = this.state
    const filteredListings = (() => {
      switch (filter) {
      case 'active':
        return listings.filter(l => l.status === 'active')
      case 'inactive':
        return listings.filter(l => l.status === 'inactive')
      default:
        return listings
      }
    })()

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          {loading && (
            <div className="row">
              <div className="col-12 text-center">
                <h1>
                  <FormattedMessage
                    id={'my-listings.loading'}
                    defaultMessage={'Loading...'}
                  />
                </h1>
              </div>
            </div>
          )}
          {!loading &&
            !listings.length && (
            <div className="row">
              <div className="col-12 text-center">
                <img src="images/empty-listings-graphic.svg" />
                <h1>
                  <FormattedMessage
                    id={'my-listings.no-listings'}
                    defaultMessage={"You don't have any listings yet."}
                  />
                </h1>
                <p>
                  <FormattedMessage
                    id={'my-listings.no-listings-steps'}
                    defaultMessage={
                      'Follow the steps below to create your first listing!'
                    }
                  />
                </p>
                <br />
                <br />
                <div className="row">
                  <div className="col-12 col-sm-4 col-lg-2 offset-lg-3 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={'my-listings.number-one'}
                          defaultMessage={'1'}
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={'my-listings.step-one'}
                        defaultMessage={
                          'Choose the right category for your listing.'
                        }
                      />
                    </p>
                  </div>
                  <div className="col-12 col-sm-4 col-lg-2 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={'my-listings.number-two '}
                          defaultMessage={'2'}
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={'my-listings.step-two '}
                        defaultMessage={
                          'Give your listing a name, description, and price.'
                        }
                      />
                    </p>
                  </div>
                  <div className="col-12 col-sm-4 col-lg-2 text-center">
                    <div className="numberCircle">
                      <h1 className="circle-text">
                        <FormattedMessage
                          id={'my-listings.number-three '}
                          defaultMessage={'3'}
                        />
                      </h1>
                    </div>
                    <p>
                      <FormattedMessage
                        id={'my-listings.step-three '}
                        defaultMessage={
                          'Preview your listing and publish it to the blockchain.'
                        }
                      />
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 text-center">
                    <br />
                    <br />
                    <a
                      href="#/create"
                      className="btn btn-lrg btn-primary btn-auto-width"
                    >
                      <FormattedMessage
                        id={'my-listings.create-listing'}
                        defaultMessage={'Create Your First Listing'}
                      />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          {!loading &&
            !!listings.length && (
            <div className="row">
              <div className="col-12">
                <div className="row">
                  <div className="col-12">
                    <h1>
                      <FormattedMessage
                        id={'my-listings.myListingsHeading'}
                        defaultMessage={'My Listings'}
                      />
                    </h1>
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 col-md-3">
                    <div className="filters list-group flex-row flex-md-column">
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'all' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'all' })}
                      >
                        <FormattedMessage
                          id={'my-listings.all'}
                          defaultMessage={'All'}
                        />
                      </a>
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'active' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'active' })}
                      >
                        <FormattedMessage
                          id={'my-listings.active'}
                          defaultMessage={'Active'}
                        />
                      </a>
                      <a
                        className={`list-group-item list-group-item-action${
                          filter === 'inactive' ? ' active' : ''
                        }`}
                        onClick={() => this.setState({ filter: 'inactive' })}
                      >
                        <FormattedMessage
                          id={'my-listings.inactive'}
                          defaultMessage={'Inactive'}
                        />
                      </a>
                    </div>
                  </div>
                  <div className="col-12 col-md-9">
                    <div className="my-listings-list">
                      {filteredListings.map(l => (
                        <MyListingCard
                          key={`my-listing-${l.id}`}
                          listing={l}
                          handleProcessing={this.handleProcessing}
                          handleUpdate={this.handleUpdate}
                          onClose={() => this.refreshListing(l.id)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {processing && <ProviderModal />}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    web3Account: state.app.web3.account,
    web3Intent: state.app.web3.intent
  }
}

const mapDispatchToProps = dispatch => ({
  storeWeb3Intent: intent => dispatch(storeWeb3Intent(intent))
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MyListings)
