import React, { useState, useEffect } from 'react'
import Fingerprint2 from 'fingerprintjs2'
import memoize from 'lodash/memoize'

let cachedFingerprintData

const browserPropsWhitelist = [
  'language',
  'platform',
  'screenResolution',
  'userAgent'
]

async function getFingerprintFn() {
  return await new Promise(resolve => {
    Fingerprint2.get({}, components => {
      const values = components.map(component => component.value)
      const hash = `V1-${Fingerprint2.x64hash128(values.join(''), 31)}`

      // Select the browser properties to export along with the fingerprint.
      const browserProps = {}
      components
        .filter(x => browserPropsWhitelist.includes(x.key))
        .forEach(x => (browserProps[x.key] = x.value))
      cachedFingerprintData = { fingerprint: hash, ...browserProps }

      resolve(cachedFingerprintData)
    })
  })
}
const getFingerprint = memoize(getFingerprintFn)

function withFingerprint(WrappedComponent) {
  const WithFingerprint = props => {
    const [fingerprintData, setFingerprintData] = useState(
      cachedFingerprintData
    )

    useEffect(() => {
      let timeout, idleCallback
      if (cachedFingerprintData) {
        return
      } else if (window.requestIdleCallback) {
        idleCallback = requestIdleCallback(async () =>
          setFingerprintData(await getFingerprint())
        )
      } else {
        timeout = setTimeout(
          async () => setFingerprintData(await getFingerprint()),
          500
        )
      }
      return function cleanup() {
        clearTimeout(timeout)
        cancelIdleCallback(idleCallback)
      }
    })

    return <WrappedComponent {...props} fingerprintData={fingerprintData} />
  }
  return WithFingerprint
}

export default withFingerprint
