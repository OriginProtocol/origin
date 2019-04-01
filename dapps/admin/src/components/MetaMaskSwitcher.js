import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import { Switch, Tooltip, Icon } from '@blueprintjs/core'

import gql from 'graphql-tag'

const MetaMaskEnabled = gql`
  query MetaMaskEnabled {
    web3 {
      metaMaskAvailable
      metaMaskEnabled
      metaMaskNetworkId
      useMetaMask
      networkId
      metaMaskAccount {
        id
      }
    }
  }
`

const ToggleMetaMaskMutation = gql`
  mutation ToggleMetaMask($enabled: Boolean) {
    toggleMetaMask(enabled: $enabled)
  }
`

class MetaMaskSwitcher extends Component {
  render() {
    return (
      <Mutation
        mutation={ToggleMetaMaskMutation}
        refetchQueries={['MetaMaskEnabled']}
      >
        {toggleMetaMask => (
          <Query query={MetaMaskEnabled}>
            {({ loading, error, data }) => {
              if (loading || error) return null
              const web3 = data && data.web3 ? data.web3 : {}
              const loggedIn = web3.metaMaskAccount ? true : false
              const checked = web3.useMetaMask && loggedIn
              let warning
              if (checked && web3.networkId !== web3.metaMaskNetworkId) {
                warning = (
                  <Icon
                    icon="warning-sign"
                    intent="warning"
                    style={{ marginLeft: 8 }}
                  />
                )
              }
              const SwitchCmp = (
                <Switch
                  inline={true}
                  disabled={!web3.metaMaskAvailable}
                  checked={checked}
                  onChange={async e => {
                    const enabled = e.currentTarget.checked ? true : false
                    if (await window.ethereum.enable()) {
                      toggleMetaMask({ variables: { enabled } })
                    }
                  }}
                  className="mb-0"
                  label={
                    <>
                      <img
                        src="images/metamask.png"
                        style={{ width: 16, verticalAlign: -3 }}
                      />
                      {warning}
                    </>
                  }
                />
              )
              if (!web3.metaMaskAvailable) {
                return (
                  <Tooltip content="MetaMask unavailable">{SwitchCmp}</Tooltip>
                )
              } else if (web3.networkId !== web3.metaMaskNetworkId) {
                return (
                  <Tooltip
                    content={`MetaMask not on network ${web3.networkId}`}
                  >
                    {SwitchCmp}
                  </Tooltip>
                )
              }
              return SwitchCmp
            }}
          </Query>
        )}
      </Mutation>
    )
  }
}

export default MetaMaskSwitcher
