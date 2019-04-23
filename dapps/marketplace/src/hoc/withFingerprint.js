import React, { useState, useEffect } from 'react'
import Fingerprint2 from 'fingerprintjs2'
import memoize from 'lodash/memoize'

let cachedFingerprint

async function getFingerprintFn() {
  return await new Promise(resolve => {
    Fingerprint2.get({}, components => {
      const values = components.map(component => component.value)
      const hash = `V1-${Fingerprint2.x64hash128(values.join(''), 31)}`
      cachedFingerprint = hash
      resolve(hash)
    })
  })
}
const getFingerprint = memoize(getFingerprintFn)

function withFingerprint(WrappedComponent) {
  const WithFingerprint = props => {
    const [fingerprint, setFingerprint] = useState(cachedFingerprint)

    useEffect(() => {
      let timeout, idleCallback
      if (cachedFingerprint) {
        return
      } else if (window.requestIdleCallback) {
        idleCallback = requestIdleCallback(async () =>
          setFingerprint(await getFingerprint())
        )
      } else {
        timeout = setTimeout(
          async () => setFingerprint(await getFingerprint()),
          500
        )
      }
      return function cleanup() {
        clearTimeout(timeout)
        cancelIdleCallback(idleCallback)
      }
    })

    return <WrappedComponent {...props} fingerprint={fingerprint} />
  }
  return WithFingerprint
}

export default withFingerprint
