import React from 'react'
import gql from 'graphql-tag'
import {
  useQuery,
  useMutation,
  useSubscription,
  useApolloClient
} from '@apollo/react-hooks'
import { Button, Popover, Position, Menu, Switch } from '@blueprintjs/core'
import numberFormat from 'utils/numberFormat'
import get from 'lodash/get'
import pick from 'lodash/pick'

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

const ConfigQuery = gql`
  query Config {
    config
    configObj {
      proxyAccountsEnabled
      relayerEnabled
      performanceMode
    }
  }
`

const BlockNumber = ({ prefix }) => {
  const { data, loading, error } = useSubscription(NEW_BLOCKS_SUBSCRIPTION)
  const blockNum = numberFormat(Number(get(data, 'newBlock.id', 0)))
  const txt = error ? 'Error...' : loading ? 'Loading...' : `block ${blockNum}`
  return `${prefix} (${txt})`
}

const Subs = () => {
  const client = useApolloClient()
  const { data, refetch } = useQuery(ConfigQuery)
  const [setNetworkMutation] = useMutation(SetNetworkMutation)
  const setNetwork = (network, customConfig = {}) => {
    setNetworkMutation({ variables: { network, customConfig } })
    client.reFetchObservableQueries()
  }

  const net = data.config
  const config = pick(
    get(data, 'configObj', {}),
    'relayerEnabled',
    'performanceMode',
    'proxyAccountsEnabled'
  )

  let networkName = 'Custom network'
  if (localStorage.ognNetwork === 'mainnet') {
    networkName = 'Ethereum Mainnet'
  } else if (localStorage.ognNetwork === 'rinkeby') {
    networkName = 'Rinkeby'
  } else if (localStorage.ognNetwork === 'origin') {
    networkName = 'Origin Testnet'
  }

  return (
    <Popover
      content={
        <>
          <Menu>
            <Menu.Item
              active={net === 'mainnet'}
              text="Mainnet"
              onClick={() => setNetwork('mainnet')}
            />
            <Menu.Item
              active={net === 'rinkeby'}
              text="Rinkeby"
              onClick={() => setNetwork('rinkeby')}
            />
            <Menu.Item
              active={net === 'origin'}
              text="Origin"
              onClick={() => setNetwork('origin')}
            />
            <Menu.Item
              active={net === 'localhost'}
              text="Local"
              onClick={() => setNetwork('localhost')}
            />
            <Menu.Item
              active={net === 'kovanTst'}
              text="Kovan"
              onClick={() => setNetwork('kovanTst')}
            />
            <Menu.Divider />
          </Menu>
          <div style={{ margin: '0.25rem 0 1rem 0.75rem' }}>
            <Switch
              checked={config.performanceMode}
              onChange={async e => {
                setNetwork(net, {
                  ...config,
                  performanceMode: e.currentTarget.checked
                })
                refetch()
              }}
              label="Performance"
            />
            <Switch
              checked={config.relayerEnabled}
              onChange={async e => {
                setNetwork(net, {
                  ...config,
                  relayerEnabled: e.currentTarget.checked
                })
                refetch()
              }}
              label="Relayer"
            />
            <Switch
              checked={config.proxyAccountsEnabled}
              onChange={async e => {
                setNetwork(net, {
                  ...config,
                  proxyAccountsEnabled: e.currentTarget.checked
                })
                refetch()
              }}
              label="Proxies"
            />
          </div>
        </>
      }
      position={Position.BOTTOM}
    >
      <Button minimal={true} text={<BlockNumber prefix={networkName} />} />
    </Popover>
  )
}

export default Subs
