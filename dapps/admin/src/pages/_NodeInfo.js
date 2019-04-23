import React from 'react'
import gql from 'graphql-tag'
import { Subscription, Mutation } from 'react-apollo'
import { Button, Popover, Position, Menu } from '@blueprintjs/core'
import numberFormat from 'utils/numberFormat'

const NEW_BLOCKS_SUBSCRIPTION = gql`
  subscription onNewBlock {
    newBlock {
      id
      number
    }
  }
`

const SetNetworkMutation = gql`
  mutation SetNetwork($network: String) {
    setNetwork(network: $network)
  }
`

const Subs = () => (
  <Mutation mutation={SetNetworkMutation}>
    {(setNetwork, { client }) => (
      <Subscription subscription={NEW_BLOCKS_SUBSCRIPTION}>
        {({ data, loading, error }) => {
          let networkName = 'Custom network'
          if (localStorage.ognNetwork === 'mainnet') {
            networkName = 'Ethereum Mainnet'
          } else if (localStorage.ognNetwork === 'rinkeby') {
            networkName = 'Rinkeby'
          }
          return (
            <Popover
              content={
                <Menu>
                  <Menu.Item
                    text="Mainnet"
                    onClick={() => {
                      setNetwork({ variables: { network: 'mainnet' } })
                      client.resetStore()
                    }}
                  />
                  <Menu.Item
                    text="Rinkeby"
                    onClick={() => {
                      setNetwork({ variables: { network: 'rinkeby' } })
                      client.resetStore()
                    }}
                  />
                  <Menu.Item
                    text="Localhost"
                    onClick={() => {
                      setNetwork({ variables: { network: 'localhost' } })
                      client.resetStore()
                    }}
                  />
                  <Menu.Item
                    text="Rinkby Test"
                    onClick={() => {
                      setNetwork({ variables: { network: 'rinkebyTst' } })
                      client.resetStore()
                    }}
                  />
                  <Menu.Item
                    text="Kovan Test"
                    onClick={() => {
                      setNetwork({ variables: { network: 'kovanTst' } })
                      client.resetStore()
                    }}
                  />
                  <Menu.Item
                    text="Origin Testnet"
                    onClick={() => {
                      setNetwork({ variables: { network: 'origin' } })
                      client.resetStore()
                    }}
                  />
                </Menu>
              }
              position={Position.BOTTOM}
            >
              <Button
                minimal={true}
                text={`${networkName} (${
                  error
                    ? 'Error...'
                    : loading
                    ? 'Loading...'
                    : `block ${numberFormat(data.newBlock.number)}`
                })`}
              />
            </Popover>
          )
        }}
      </Subscription>
    )}
  </Mutation>
)

export default Subs
