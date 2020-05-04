import React from 'react'

const ShopReady = ({ hash, domain, gateway }) => {
  const gatewayUrl = `${gateway}/ipfs/${hash}/`
  const url = domain || gatewayUrl
  return (
    <>
      Your shop is ready!
      <div className="mt-2 mb-2">
        {'IPFS Hash: '}
        <a href={gatewayUrl} target="_blank" rel="noopener noreferrer">
          {hash}
        </a>
      </div>
      {domain ? <div className="mb-2">{`Domain: ${domain}`}</div> : null}
      <button
        className="btn btn-primary btn-lg mt-2"
        onClick={() => window.open(url)}
        children="View Shop"
      />
    </>
  )
}

export default ShopReady
