import React, { Component } from 'react'
import { Query } from 'react-apollo'

import numberFormat from 'utils/numberFormat'

import gql from 'graphql-tag'

const CurrentPrice = gql`
  {
    ethUsd
  }
`

class Price extends Component {
  render() {
    const { label, amount, className, showEth } = this.props
    if (!amount) return null
    return (
      <Query query={CurrentPrice}>
        {({ loading, error, data }) => {
          if (loading || error) return null
          const usdAmount = data.ethUsd * Number(amount || 0)
          let rounded = Math.round(usdAmount * 100) / 100
          if (usdAmount > 0 && rounded === 0) rounded = 0.01
          rounded = numberFormat(rounded, 2)
          const eth = ` (${amount} ETH)`
          return (
            <span className={className}>{`${
              label ? `${label} ` : ''
            }$${rounded}${showEth ? eth : ''}`}</span>
          )
        }}
      </Query>
    )
  }
}

export default Price
