import React, { Component } from 'react'
import { Query } from 'react-apollo'

import { HTMLSelect } from '@blueprintjs/core'

import groupBy from 'lodash/groupBy'

import gql from 'graphql-tag'

const AllAccounts = gql`
  query AllAccounts {
    web3 {
      accounts {
        id
        role
        name
      }
      useMetaMask
      metaMaskAccount {
        id
        role
        name
      }
    }
  }
`

class SelectAccount extends Component {
  render() {
    return (
      <Query query={AllAccounts}>
        {({ loading, error, data }) => {
          if (loading || error) return null
          const groups = groupBy(data.web3.accounts, a => a.role)
          const options = Object.keys(groups).map((group, idx) => (
            <optgroup key={idx} label={group}>
              {groups[group].map((a, itemIdx) => (
                <option value={a.id} key={itemIdx}>{`${(a.name || a.id).substr(
                  0,
                  24
                )}`}</option>
              ))}
            </optgroup>
          ))
          let disabled = false
          if (data.web3.metaMaskAccount) {
            const acct = data.web3.metaMaskAccount
            disabled = true
            options.unshift(
              <option value={acct.id} key={'mm'}>{`MetaMask Account: ${(
                acct.name || acct.id
              ).substr(0, 8)}`}</option>
            )
          }
          return (
            <HTMLSelect
              value={this.props.value}
              onChange={this.props.onChange}
              disabled={disabled}
              fill={true}
            >
              {options}
            </HTMLSelect>
          )
        }}
      </Query>
    )
  }
}

export default SelectAccount
