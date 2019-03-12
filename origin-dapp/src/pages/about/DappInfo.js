import React, { Fragment } from 'react'
import { Query } from 'react-apollo'
import configQuery from 'queries/Config'
import contractsQuery from 'queries/AllContracts'
import PageTitle from 'components/PageTitle'
import growthEligibilityQuery from 'queries/GrowthEligibility'
import dayjs from 'dayjs'
import distanceToNow from 'utils/distanceToNow'

const DAPP_VERSION = require('../../../package.json').version

const sectionThead = ({ title }) => (
  <thead>
    <tr>
      <th colSpan="2">
        <h3>{title}</h3>
      </th>
    </tr>
  </thead>
)

const dataTr = ({ key, value }) => (
  <tr key={key}>
    <th>{key}</th>
    <td>{value}</td>
  </tr>
)

const Address = ({ address }) => {
  if (!address) {
    return null
  }
  const addressId = typeof address === 'string' ? address : address.id
  if (addressId === '0x0000000000000000000000000000000000000000') {
    return null
  }
  return <span title={addressId}>{addressId.substr(0, 6)}</span>
}

function totalSupply(supply, decimals) {
  const supplyBN = web3.utils.toBN(supply)
  const decimalsBN = web3.utils.toBN(web3.utils.padRight('1', decimals + 1))
  return supplyBN.div(decimalsBN).toString()
}

const DappInfo = () => {
  const gitHash = (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={`https://github.com/OriginProtocol/origin/commit/${
        process.env.GIT_COMMIT_HASH
      }`}
    >
      {process.env.GIT_COMMIT_HASH}
    </a>
  )
  const buildTimestamp = process.env.BUILD_TIMESTAMP
  let buildTime
  if (buildTimestamp) {
    buildTime = dayjs(buildTimestamp).format('YYYY-MM-DD H:mma')
    buildTime += ` (${distanceToNow(buildTimestamp / 1000)} ago)`
  }

  return (
    <div className="container about-info">
      <PageTitle>About DApp</PageTitle>
      <h1>About DApp</h1>
      <p>
        Developer information about this DApp&#39;s current build and
        configuration.
      </p>
      <div className="row">
        <section className="col-lg-6">
          <table className="config-table">
            {sectionThead({ title: 'DApp' })}
            <tbody>
              {dataTr({ key: 'DAPP Version', value: DAPP_VERSION })}
              {buildTimestamp
                ? dataTr({
                    key: 'Build time',
                    value: buildTime
                  })
                : null}
              {dataTr({
                key: 'Git Commit Hash',
                value: gitHash
              })}
              {dataTr({
                key: 'Git Branch',
                value: process.env.GIT_BRANCH
              })}
              <Query query={growthEligibilityQuery}>
                {({ networkStatus, error, loading, data }) => {
                  if (networkStatus === 1 || loading) {
                    return dataTr({
                      key: 'Detected country',
                      value: 'Loading...'
                    })
                  } else if (error) {
                    return dataTr({
                      key: 'Detected country',
                      value: 'Error fetching country'
                    })
                  }

                  const { countryName, eligibility } = data.isEligible
                  return (
                    <Fragment>
                      {dataTr({ key: 'Detected country', value: countryName })}
                      {dataTr({
                        key: 'Growth eligibility: ',
                        value: eligibility
                      })}
                    </Fragment>
                  )
                }}
              </Query>
            </tbody>
          </table>

          <Query query={configQuery} notifyOnNetworkStatusChange={true}>
            {({ error, data, networkStatus }) => {
              if (networkStatus === 1) {
                return <p>Loading...</p>
              } else if (error) {
                return <p>Error :(</p>
              }
              return (
                <table className="config-table">
                  {sectionThead({ title: 'Origin GraphQL' })}
                  <tbody>
                    {dataTr({ key: 'network', value: data.config })}
                    {Object.entries(data.configObj).map(entry => {
                      const [key, value] = entry
                      if (key == '__typename') {
                        return
                      }
                      return dataTr({ key, value })
                    })}
                    {dataTr({
                      key: 'Growth Enabled',
                      value: process.env.ENABLE_GROWTH
                    })}
                  </tbody>
                </table>
              )
            }}
          </Query>
        </section>

        <Query query={contractsQuery} notifyOnNetworkStatusChange={true}>
          {({ error, data, networkStatus }) => {
            const marketplaces = data.marketplaces || []
            const tokens = data.tokens || []
            if (networkStatus === 1) {
              return <p>Loading...</p>
            } else if (error) {
              return <p>Loading...</p>
            }
            return (
              <section className="col-lg-6">
                <table className="config-table">
                  <thead>
                    <tr>
                      <th colSpan="5">
                        <h3>Marketplace Contracts</h3>
                      </th>
                    </tr>
                    <tr>
                      <th>Version</th>
                      <th>Listings</th>
                      <th>Token</th>
                      <th>Address</th>
                      <th>Owner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketplaces.map(m => (
                      <tr key={m.address}>
                        <td>{m.version}</td>
                        <td>{m.totalListings}</td>
                        <td>
                          <Address address={m.token} />
                        </td>
                        <td>
                          <Address address={m.address} />
                        </td>
                        <td>
                          <Address address={m.owner.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <table className="config-table">
                  <thead>
                    <tr>
                      <th colSpan="5">
                        <h3>Token Contracts</h3>
                      </th>
                    </tr>
                    <tr>
                      <th>Symbol</th>
                      <th>Name</th>
                      <th>Address</th>
                      <th>Decimals</th>
                      <th>Supply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tokens.map(m => (
                      <tr key={m.id}>
                        <td>{m.symbol}</td>
                        <td>{m.name}</td>
                        <td>
                          <Address address={m.address} />
                        </td>
                        <td>{m.decimals}</td>
                        <td>{totalSupply(m.totalSupply, m.decimals)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <table className="config-table">
                  <thead>
                    <tr>
                      <th>
                        <h3>Environment Variables</h3>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th>DOCKER</th>
                      <td>{process.env.DOCKER}</td>
                    </tr>
                    <tr>
                      <th>ENABLE_GROWTH</th>
                      <td>{process.env.ENABLE_GROWTH}</td>
                    </tr>
                    <tr>
                      <th>HOST</th>
                      <td>{process.env.HOST}</td>
                    </tr>
                    <tr>
                      <th>IPFS_SWARM</th>
                      <td>{process.env.IPFS_SWARM}</td>
                    </tr>
                    <tr>
                      <th>ORIGIN_LINKING</th>
                      <td>{process.env.ORIGIN_LINKING}</td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )
          }}
        </Query>
      </div>
    </div>
  )
}

require('react-styl')(`
  .about-info
    margin-top: 3rem
    table.config-table
      margin-bottom: 1.5rem
      thead
        th
          border-bottom: solid 1px #eee
        h3
          margin-top: 0.3rem
          margin-bottom: 0.0rem
      td, th
        padding: 4px 8px
        font-weight:normal
      td
        font-family: monospace
        font-size: 0.75rem
        word-break: break-all
`)

export default DappInfo
