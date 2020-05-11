import React from 'react'

import Link from 'components/Link'

const ShopReady = ({ hash, domain, gateway }) => {
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
      <div className="mt-3">
        <Link
          className="btn btn-primary btn-lg mt-2"
          to="/super-admin/shops"
          children="Continue"
        />
      </div>
    </>
  )
}

export default ShopReady
