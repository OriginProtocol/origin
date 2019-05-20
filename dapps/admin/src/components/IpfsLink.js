import React from 'react'

import { getIpfsHashFromBytes32 } from 'utils/ipfsHash'
import { getIpfsGateway } from 'utils/config'

export default function IpfsLink(props) {
  if (props.rawHash === undefined) {
    return <span>None</span>
  }
  const hash = getIpfsHashFromBytes32(props.rawHash)
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
