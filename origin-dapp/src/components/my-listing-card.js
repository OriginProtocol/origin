import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'

import {
  update as updateTransaction,
  upsert as upsertTransaction
} from 'actions/Transaction'

import origin from '../services/origin'

class MyListingCard extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      confirmCloseListing: {
        id: 'my-listing-card.confirmCloseListing',
        defaultMessage:
          'Are you sure that you want to permanently close this listing? This cannot be undone.'
      }
    })

    this.closeListing = this.closeListing.bind(this)
  }

  async closeListing() {
    const {
      intl,
      listing,
      handleProcessing,
      onClose,
      updateTransaction
    } = this.props
    const { address } = listing
    const prompt = confirm(
      intl.formatMessage(this.intlMessages.confirmCloseListing)
    )

    if (!prompt) {
      return null
    }

    try {
      handleProcessing(true)

      const {
        created,
        transactionReceipt
      } = await origin.marketplace.withdrawListing(
        this.props.listing.id,
        {},
        (confirmationCount, transactionReceipt) => {
          // Having a transaction receipt doesn't guarantee that the listing status will have changed.
          // Let's relentlessly retrieve the data so that we are sure to get it. - Micah
          onClose && onClose()

          updateTransaction(confirmationCount, transactionReceipt)
        }
      )

      this.props.upsertTransaction({
        ...transactionReceipt,
        created,
        transactionTypeKey: 'closeListing'
      })

      handleProcessing(false)
    } catch (error) {
      handleProcessing(false)
      console.error(`Error closing listing ${address}`)
      console.error(error)
    }
  }

  render() {
    const { listing } = this.props
    const { category, name, pictures } = listing
    const status = listing.status
    // const timestamp = `Created on ${moment(createdAt).format('MMMM D, YYYY')}`
    const photo = pictures && pictures.length > 0 && pictures[0]

    return (
      <div className="purchase card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <div
              className={`${
                photo ? '' : 'placeholder '
              }image-container d-flex justify-content-center`}
            >
              <img
                src={photo || 'images/default-image.svg'}
                role="presentation"
              />
            </div>
          </div>
          <div className="content-container d-flex flex-column">
            <span className={`status ${status}`}>{status}</span>
            <p className="category">{category}</p>
            <h2 className="title text-truncate" title={name}>
              <Link to={`/listing/${listing.id}`}>{name}</Link>
            </h2>
            {/*<p className="timestamp">{timestamp}</p>*/}
            {/*<p className="price">
              {`${Number(price).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} ETH`}
              {!parseInt(unitsRemaining) &&
                <span className="badge badge-info">
                  <FormattedMessage
                    id={ 'my-listing-card.soldOut' }
                    defaultMessage={ 'Sold Out' }
                  />
                </span>
              }
            </p>*/}
            <div className="d-flex counts">
              {/*<p>
                <FormattedMessage
                  id={ 'my-listing-card.totalQuantity' }
                  defaultMessage={ 'Total Quantity : {quantity}' }
                  values={{ quantity: <FormattedNumber value={unitsRemaining} /> }}
                />
              </p>*/}
              {/*<p>Total Remaining: {(unitsRemaining - quantity).toLocaleString()}</p>*/}
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
                {status === 'inactive' ? null : (
                  <Fragment>
                    <Link to={`/update/${listing.id}`}>
                        <FormattedMessage
                          id={'my-listing-card.editListing'}
                          defaultMessage={'Edit Listing'}
                        />
                    </Link>
                    <a className="warning" onClick={this.closeListing}>
                      <FormattedMessage
                        id={'my-listing-card.closeListing'}
                        defaultMessage={'Close Listing'}
                      />
                    </a>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  updateTransaction: (confirmationCount, transactionReceipt) =>
    dispatch(updateTransaction(confirmationCount, transactionReceipt)),
  upsertTransaction: transaction => dispatch(upsertTransaction(transaction))
})

export default connect(
  undefined,
  mapDispatchToProps
)(injectIntl(MyListingCard))
