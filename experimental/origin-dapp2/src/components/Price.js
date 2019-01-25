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
    const { amount, className, el } = this.props
    if (!amount) {
      if (el === 'input') {
        return <input value="" className={className} readOnly />
      }
      return <span>&nbsp;</span>
    }
    return (
      <Query query={CurrentPrice}>
        {({ loading, error, data }) => {
          if (loading || error) return <span>&nbsp;</span>
          const usdAmount = data.ethUsd * Number(amount || 0)
          let rounded = Math.round(usdAmount * 100) / 100
          if (usdAmount > 0 && rounded === 0) rounded = 0.01
          rounded = numberFormat(rounded, 2)
          if (el === 'input') {
            return <input className={className} value={rounded} readOnly />
          }
          return <span className={className}>{`${rounded} USD`}</span>
        }}
      </Query>
    )
  }
}

export default Price
