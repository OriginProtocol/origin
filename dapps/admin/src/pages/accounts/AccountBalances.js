import React, { Component } from 'react'
import { HTMLTable } from '@blueprintjs/core'
import get from 'lodash/get'

import AccountButton from '../accounts/AccountButton'
import TokenBalance from 'components/TokenBalance'
import Price from 'components/Price'

import SendFromNodeBtn from './_SendFromNodeBtn'
import RemoveWalletBtn from './_RemoveWalletBtn'

import withTokens from 'hoc/withTokens'
import withAccounts from 'hoc/withAccounts'

class AccountBalances extends Component {
  render() {
    const { tokens, accounts, maxNodeAccount } = this.props
    if (!accounts.length) {
      return null
    }
    return (
      <HTMLTable small={true} bordered={true} className="mb-3">
        <thead>
          <tr>
            <th>Wallet</th>
            <th>Role</th>
            <th>Name</th>
            <th>Eth</th>
            <th>USD</th>
            {tokens.map(token => (
              <th key={token.id}>{token.code}</th>
            ))}
            <th />
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => (
            <tr key={a.id}>
              <td>
                <AccountButton account={a} />
              </td>
              <td>{a.role}</td>
              <td>{a.name}</td>
              <td>{get(a, 'balance.eth')}</td>
              <td>
                <Price amount={get(a, 'balance.eth')} />
              </td>
              {tokens.map(token => (
                <td key={token.id}>
                  <TokenBalance account={a.id} token={token.id} />
                </td>
              ))}
              <td>
                {!maxNodeAccount ? null : (
                  <SendFromNodeBtn
                    from={maxNodeAccount}
                    to={a.id}
                    value="0.5"
                  />
                )}
                <RemoveWalletBtn address={a.id} />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    )
  }
}

export default withAccounts(withTokens(AccountBalances))
