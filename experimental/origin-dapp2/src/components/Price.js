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
      this.renderEmpty()
    }
    return (
      <Query query={CurrentPrice}>
        {({ loading, error, data }) => {
          if (loading || error) return this.renderEmpty()
          const usdAmount = data.ethUsd * Number(amount || 0)
          let rounded = Math.round(usdAmount * 100) / 100
          if (usdAmount > 0 && rounded === 0) rounded = 0.01
          rounded = numberFormat(rounded, 2)
          if (el === 'input') {
            return <input className={className} value={rounded} readOnly tabindex="-1") />
          }
          return <span className={className}>{`${rounded} USD`}</span>
        }}
      </Query>
    )
  }

  renderEmpty() {
    if (this.props.el === 'input') {
      return <input value="" className={this.props.className} readOnly />
    }
    return <span>&nbsp;</span>
  }
}

export default Price
