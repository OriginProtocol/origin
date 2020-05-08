import React from 'react'

const ShopReady = ({ hash, domain, gateway, next }) => {
  const gatewayUrl = `${gateway}/ipfs/${hash}/`
  return (
    <>
      Your shop is ready!
      {!hash ? null : (
        <div className="mt-2 mb-2">
          {'IPFS Hash: '}
          <a href={gatewayUrl} target="_blank" rel="noopener noreferrer">
            {hash}
          </a>
        </div>
      )}
      {domain ? (
        <div className="mb-2">
          {`Domain: `}
          <a href={domain} target="_blank" rel="noopener noreferrer">
            {domain}
          </a>
        </div>
      ) : null}
      <button
        className="btn btn-primary btn-lg mt-2"
        onClick={() => next()}
        children="View Admin"
      />
    </>
  )
}

export default ShopReady
