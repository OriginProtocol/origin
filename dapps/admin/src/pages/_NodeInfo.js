import React from 'react'
import gql from 'graphql-tag'
import {
  useMutation,
  useSubscription,
  useApolloClient
} from '@apollo/react-hooks'
import { Button, Popover, Position, Menu, Switch } from '@blueprintjs/core'
import numberFormat from 'utils/numberFormat'
import get from 'lodash/get'

const NEW_BLOCKS_SUBSCRIPTION = gql`
  subscription onNewBlock {
    newBlock {
      id
    }
  }
`

const SetNetworkMutation = gql`
  mutation SetNetwork($network: String, $customConfig: ConfigInput) {
    setNetwork(network: $network, customConfig: $customConfig)
  }
`

const Subs = () => {
  const client = useApolloClient()
  const { data, loading, error } = useSubscription(NEW_BLOCKS_SUBSCRIPTION)
  const [setNetworkMutation] = useMutation(SetNetworkMutation)
  const setNetwork = network => {
    setNetworkMutation({ variables: { network } })
    client.reFetchObservableQueries()
  }

  let networkName = 'Custom network'
  if (localStorage.ognNetwork === 'mainnet') {
    networkName = 'Ethereum Mainnet'
  } else if (localStorage.ognNetwork === 'rinkeby') {
    networkName = 'Rinkeby'
  } else if (localStorage.ognNetwork === 'origin') {
    networkName = 'Origin Testnet'
  }

  const blockNum = numberFormat(Number(get(data, 'newBlock.id', 0)))

  return (
    <Popover
      content={
        <>
          <Menu>
            <Menu.Item text="Mainnet" onClick={() => setNetwork('mainnet')} />
            <Menu.Item text="Rinkeby" onClick={() => setNetwork('rinkeby')} />
            <Menu.Item text="Origin" onClick={() => setNetwork('origin')} />
            <Menu.Item text="Local" onClick={() => setNetwork('localhost')} />
            <Menu.Item text="Kovan" onClick={() => setNetwork('kovanTst')} />
            <Menu.Divider />
          </Menu>
          <Switch
            style={{ margin: '0.25rem 0 0.75rem 0.75rem' }}
            checked={false}
            onChange={async e => {
              console.log(e.currentTarget.checked)
            }}
            label="Performance"
          />
          <Switch
            style={{ margin: '0 0 0.75rem 0.75rem' }}
            checked={false}
            onChange={async e => {
              console.log(e.currentTarget.checked)
            }}
            label="Relayer"
          />
          <Switch
            style={{ margin: '0 0 1rem 0.75rem' }}
            checked={false}
            onChange={async e => {
              console.log(e.currentTarget.checked)
            }}
            label="Proxies"
          />
        </>
      }
      position={Position.BOTTOM}
    >
      <Button
        minimal={true}
        text={`${networkName} (${
          error ? 'Error...' : loading ? 'Loading...' : `block ${blockNum}`
        })`}
      />
    </Popover>
  )
}

export default Subs
