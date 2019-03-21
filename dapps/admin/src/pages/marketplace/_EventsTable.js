import React, { Component } from 'react'
import { getIpfsHashFromBytes32 } from 'utils/ipfsHash'
import formatDate from 'utils/formatDate'

import Identity from 'components/Identity'
import { getIpfsGateway } from 'utils/config'

function ipfs(rawHash) {
  const hash = getIpfsHashFromBytes32(rawHash)
  const ipfsGateway = getIpfsGateway()
  return (
    <a
      href={`${ipfsGateway}/ipfs/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {hash.substr(0, 6)}
    </a>
  )
}

function eventName(e) {
  const [, type, target] = e.event.split(/(Offer|Listing)/)
  const { listingID, offerID } = e.returnValues
  // console.log(e.event.split(/(Offer|Listing)/))
  if (type === 'Offer') {
    return (
      <>
        <a
          href={`#/marketplace/listings/${listingID}`}
        >{`${type} ${listingID}-${offerID} ${target}`}</a>
      </>
    )
  } else if (type === 'Listing') {
    // return `${type} ${e.returnValues.listingID} ${target}`
    return (
      <>
        <a href={`#/marketplace/listings/${listingID}`}>{`${type} ${
          e.returnValues.listingID
        } ${target}`}</a>
      </>
    )
  }
  return `${e.event} ${e.returnValues.listingID || ''}-${e.returnValues
    .offerID || ''} `
}

class EventsTable extends Component {
  render() {
    return (
      <table className="bp3-html-table bp3-small bp3-html-table-bordered">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
            <th>Sender</th>
            {/* <th>Listing</th>
            <th>Offer</th> */}
            <th>IPFS Hash</th>
            <th>#</th>
          </tr>
        </thead>
        <tbody>
          {this.props.events.map(e => (
            <tr key={e.id}>
              <td>{formatDate(e.block.timestamp)}</td>
              <td>{eventName(e)}</td>
              <td>
                <Identity account={e.returnValues.party} />
              </td>
              {/* <td>{e.returnValues.listingID}</td>
              <td>{e.returnValues.offerID}</td> */}
              <td>{ipfs(e.returnValues.ipfsHash)}</td>
              <td>{e.blockNumber}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }
}

export default EventsTable
