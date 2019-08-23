import React from 'react'

const EthAddress = props => (
  <span className="eth-address">
    {props.long
      ? props.address
      : `${props.address.slice(0, 4)}...${props.address.slice(-4)}`}
  </span>
)

export default EthAddress
