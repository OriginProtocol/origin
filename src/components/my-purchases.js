import React, { Component } from 'react'
import { connect } from 'react-redux'
import MyPurchaseCard from './my-purchase-card'

import { storeWeb3Intent } from '../actions/App'
import origin from '../services/origin'

class MyPurchases extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.state = { filter: 'pending', purchases: [], loading: true }
  }

  componentDidMount() {
    if(!web3.givenProvider || !this.props.web3Account) {
      this.props.storeWeb3Intent('view your purchases')
    }
  }

  /*
  * WARNING: These functions don't actually return what they might imply.
  * They use return statements to chain together async calls. Oops.
  *
  * For now, we mock a getByPurchaserAddress request by fetching all
  * listings individually and fetching all related purchases individually.
  */

  async getListingIds() {
    try {
      const ids = await origin.listings.allIds()

      return await Promise.all(ids.map(this.loadListing))
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  async getPurchaseAddress(addr, i) {
    try {
      const purchAddr = await origin.listings.purchaseAddressByIndex(addr, i)

      return this.loadPurchase(purchAddr)
    } catch(error) {
      console.error(`Error fetching purchase address at: ${i}`)
    }
  }

  async getPurchasesLength(addr) {
    try {
      const len = await origin.listings.purchasesLength(addr)

      if (!len) {
        return len
      }

      return await Promise.all([...Array(len).keys()].map(i => this.getPurchaseAddress(addr, i)))
    } catch(error) {
      console.error(`Error fetching purchases length for listing: ${addr}`)
    }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      return this.getPurchasesLength(listing.address)
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async loadPurchase(addr) {
    try {
      const purchase = await origin.purchases.get(addr)
      
      if (purchase.buyerAddress === this.props.web3Account) {
        const purchases = [...this.state.purchases, purchase]

        this.setState({ purchases })
      }

      return purchase
    } catch(error) {
      console.error(`Error fetching purchase: ${addr}`, error)
    }
  }

  async componentWillMount() {
    await this.getListingIds()

    this.setState({ loading: false })
  }

  render() {
    const { filter, loading, purchases } = this.state
    const filteredPurchases = (() => {
      switch(filter) {
        case 'pending':
          return purchases.filter(p => p.stage !== 'complete')
        case 'complete':
          return purchases.filter(p => p.stage === 'complete')
        default:
          return purchases
      }
    })()

    return (
      <div className="my-purchases-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1>My Purchases</h1>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-3">
              {loading && 'Loading...'}
              {!loading && !purchases.length && 'You currently have no purchases.'}
              {!loading && !!purchases.length &&
                <div className="filters list-group flex-row flex-md-column">
                  <a className={`list-group-item list-group-item-action${filter === 'pending' ? ' active' : ''}`}
                    onClick={() => this.setState({ filter: 'pending' })}>Pending</a>
                  <a className={`list-group-item list-group-item-action${filter === 'complete' ? ' active' : ''}`}
                    onClick={() => this.setState({ filter: 'complete' })}>Complete</a>
                  <a className={`list-group-item list-group-item-action${filter === 'all' ? ' active' : ''}`}
                    onClick={() => this.setState({ filter: 'all' })}>All</a>
                </div>
              }
            </div>
            <div className="col-12 col-md-9">
              <div className="my-listings-list">
                {filteredPurchases.map(p => <MyPurchaseCard key={`my-purchase-${p.address}`} purchase={p} />)}
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

export default connect(mapStateToProps, mapDispatchToProps)(MyPurchases)
