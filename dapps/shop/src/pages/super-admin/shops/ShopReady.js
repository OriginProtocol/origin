import React from 'react'
import { useHistory } from 'react-router-dom'

import { useStateValue } from 'data/state'

const ShopReady = ({ hash, domain, gateway }) => {
  const gatewayUrl = `${gateway}/ipfs/${hash}/`
  const history = useHistory()
  const [, dispatch] = useStateValue()
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
        <button
          type="button"
          className="btn btn-primary btn-lg mt-2"
          children="Continue"
          onClick={() => {
            dispatch({ type: 'reload', target: 'auth' })
            history.push('/super-admin/shops')

          }}
        />
      </div>
    </>
  )
}

export default ShopReady
