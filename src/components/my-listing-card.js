import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import { FormattedMessage, FormattedNumber, defineMessages, injectIntl } from 'react-intl'

import {
  update as updateTransaction,
  upsert as upsertTransaction,
} from 'actions/Transaction'

import { translateListingCategory } from 'utils/translationUtils'

import origin from '../services/origin'

class MyListingCard extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      confirmCloseListing: {
        id: 'my-listing-card.confirmCloseListing',
        defaultMessage: 'Are you sure that you want to permanently close this listing? This cannot be undone.'
      },
      ETH: {
        id: 'my-listing-card.ethereumCurrencyAbbrev',
        defaultMessage: 'ETH'
      }
    })

    this.closeListing = this.closeListing.bind(this)
  }

  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  async closeListing() {
    const{ intl, listing, handleProcessing, handleUpdate, updateTransaction } = this.props
    const { address } = listing
    const prompt = confirm(intl.formatMessage(this.intlMessages.confirmCloseListing))

    if (!prompt) {
      return null
    }

    try {
      handleProcessing(true)

      const { created, transactionReceipt } = await origin.listings.close(address, (confirmationCount, transactionReceipt) => {
        // Having a transaction receipt doesn't guarantee that the listing state will have changed.
        // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
        handleUpdate(address)

        this.props.updateTransaction(confirmationCount, transactionReceipt)
      })

      this.props.upsertTransaction({
        ...transactionReceipt,
        created,
        transactionTypeKey: 'closeListing',
      })

      handleProcessing(false)
    } catch(error) {
      handleProcessing(false)
      console.error(`Error closing listing ${address}`)
      console.error(error)
    }
  }

  render() {
    const { address, category, /*createdAt, */name, pictures, price, unitsAvailable } = translateListingCategory(this.props.listing)
    /*
     *  Micah 4/23/2018
     *  ~~~~~~~~~~~~~~~
     *  origin.listings.close sets unitsAvailable to 0.
     *  There is no distinction between active/inactive, sold out, or closed.
     *  These states should be considered as editing is explored.
     *  There are no denormalized "transaction completed" or "transaction in progress" counts.
     */
    const status = parseInt(unitsAvailable) > 0 ? 'active' : 'inactive'
    // const timestamp = `Created on ${moment(createdAt).format('MMMM D, YYYY')}`
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <div className="purchase card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
              <img src={photo || 'images/default-image.svg'} role="presentation" />
            </div>
          </div>
          <div className="content-container d-flex flex-column">
            <span className={`status ${status}`}>{status}</span>
            <p className="category">{category}</p>
            <h2 className="title text-truncate"><Link to={`/listing/${address}`}>{name}</Link></h2>
            {/*<p className="timestamp">{timestamp}</p>*/}
            <p className="price">
              {`${Number(price).toLocaleString(undefined, { minimumFractionDigits: 3 })} ETH`}
              {!parseInt(unitsAvailable) /*<= quantity*/ && 
                <span className="badge badge-info">
                  <FormattedMessage
                    id={ 'my-listing-card.soldOut' }
                    defaultMessage={ 'Sold Out' }
                  />
                </span>
              }
            </p>
            <div className="d-flex counts">
              <p>
                <FormattedMessage
                  id={ 'my-listing-card.totalQuantity' }
                  defaultMessage={ 'Total Quantity : {quantity}' }
                  values={{ quantity: <FormattedNumber value={unitsAvailable} /> }}
                />
              </p>
              {/*<p>Total Remaining: {(unitsAvailable - quantity).toLocaleString()}</p>*/}
            </div>
            <div className="d-flex counts">
              {/*<p>{Number(2).toLocaleString()} Pending Transactions</p>*/}
              {/*<p>{Number(3).toLocaleString()} Completed Transactions</p>*/}
            </div>
            <div className="actions d-flex">
              <div className="links-container">
                {/*<a onClick={() => alert('To Do')}>Edit</a>*/}
                {/*!active && <a onClick={() => alert('To Do')}>Enable</a>*/}
                {/*active && <a onClick={() => alert('To Do')}>Disable</a>*/}
                {!!parseInt(unitsAvailable) && 
                  <a className="warning" onClick={this.closeListing}>
                    <FormattedMessage
                      id={ 'my-listing-card.closeListing' }
                      defaultMessage={ 'Close Listing' }
                    />
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  updateTransaction: (confirmationCount, transactionReceipt) => dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: (transaction) => dispatch(upsertTransaction(transaction)),
})

export default connect(undefined, mapDispatchToProps)(injectIntl(MyListingCard))
