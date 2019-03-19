import React, { Component } from 'react'
import { Query } from 'react-apollo'

import gql from 'graphql-tag'

const CurrentTokenPrice = gql`
  query TokenPrice($id: String!) {
    token(id: $id) {
      symbol
      decimals
    }
  }
`

class TokenPrice extends Component {
  render() {
    const { currency, value, amount } = this.props

    // Pre-formatted prices
    if (amount) {
      if (currency === '0x0000000000000000000000000000000000000000') {
        return `${amount} ETH`
      }
      return `${amount} ${currency}`
    }

    if (value === undefined) return '???'
    if (currency === '0x0000000000000000000000000000000000000000') {
      return `${web3.utils.fromWei(value, 'ether')} ETH`
    }
    return (
      <Query query={CurrentTokenPrice} variables={{ id: currency }}>
        {({ loading, error, data }) => {
          if (loading || error || !data || !data.token) return null

          const { decimals, symbol } = data.token

          if (value.indexOf('.') >= 0) return `${value} ${symbol}`

          const supplyBN = web3.utils.toBN(value)
          const decimalsBN = web3.utils.toBN(
            web3.utils.padRight('1', decimals + 1)
          )
          const formatted = supplyBN.div(decimalsBN).toString()

          return <span>{`${formatted} ${symbol}`}</span>
        }}
      </Query>
    )
  }
}

export default TokenPrice
