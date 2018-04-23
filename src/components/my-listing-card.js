import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'
import moment from 'moment'

class MyListingCard extends Component {
  componentDidMount() {
    $('[data-toggle="tooltip"]').tooltip()
  }

  render() {
    const { active, address, category, createdAt, name, price, quantity, unitsAvailable } = this.props.listing
    const status = active ? 'active' : 'inactive'
    const timestamp = `Created on ${moment(createdAt).format('MMMM D, YYYY')}`

    return (
      <div className="transaction card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="image-container">
            <img role="presentation" />
          </div>
          <div className="content-container d-flex flex-column">
            <span className={`status ${status}`}>{status}</span>
            <p className="category">{category}</p>
            <h2 className="title text-truncate"><Link to={`/listing/${address}`}>{name}</Link></h2>
            <p className="timestamp">{timestamp}</p>
            <p className="price">
              {`${Number(price).toLocaleString(undefined, {minimumFractionDigits: 3})} ETH`}
              {unitsAvailable <= quantity && <span className="badge badge-info">Sold Out</span>}
            </p>
            <div className="d-flex counts">
              <p>Total Quantity: {unitsAvailable.toLocaleString()}</p>
              <p>Total Remaining: {(unitsAvailable - quantity).toLocaleString()}</p>
            </div>
            <div className="d-flex counts">
              <p>{Number(2).toLocaleString()} Pending Transactions</p>
              <p>{Number(3).toLocaleString()} Completed Transactions</p>
            </div>
            <div className="actions d-flex">
              <div className="links-container">
                <a onClick={() => alert('To Do')}>Edit</a>
                {!active && <a onClick={() => alert('To Do')}>Enable</a>}
                {active && <a onClick={() => alert('To Do')}>Disable</a>}
                <a className="warning" onClick={() => alert('To Do')}>Delete</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListingCard
