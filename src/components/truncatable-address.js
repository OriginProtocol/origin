import React, { Component } from 'react'

class TruncatableAddress extends Component {
  render() {
    const { address } = this.props

    return (
      <div className="address d-flex justify-content-around">
        <div>{address.slice(0, address.length/2)}</div>
        <div>{address.slice(address.length/2)}</div>
      </div>
    )
  }
}

export default TruncatableAddress
