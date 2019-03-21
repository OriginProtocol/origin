import React from 'react'
import { Query } from 'react-apollo'
import { Button, Popover, Position, Menu } from '@blueprintjs/core'

import SetWalletMutation from './_SetWalletMutation'

import query from 'queries/AllAccounts'

function accountTxt(acct) {
  return `${acct.name ? `${acct.name} ` : ''}${acct.id.substr(0, 6)} ${
    acct.balance.eth
  } ETH${acct.role ? ` (${acct.role})` : ''}`
}

const AccountChooser = () => (
  <SetWalletMutation>
    {setActiveWallet => (
      <Query query={query}>
        {({ loading, error, data }) => {
          if (loading || error || !data.web3 || !data.web3.defaultAccount)
            return null

          const acct = data.web3.defaultAccount

          return (
            <Popover
              content={
                <Menu>
                  {data.web3.accounts.map(a => (
                    <Menu.Item
                      active={acct.id === a.id}
                      key={a.id}
                      text={accountTxt(a)}
                      onClick={() =>
                        setActiveWallet({ variables: { address: a.id } })
                      }
                    />
                  ))}
                </Menu>
              }
              position={Position.BOTTOM}
            >
              <Button
                minimal={true}
                icon="bank-account"
                text={accountTxt(acct)}
              />
            </Popover>
          )
        }}
      </Query>
    )}
  </SetWalletMutation>
)

export default AccountChooser
