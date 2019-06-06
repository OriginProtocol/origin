import React, { useState, useEffect } from 'react'
import Fingerprint2 from 'fingerprintjs2'
import memoize from 'lodash/memoize'

import withWallet from './withWallet'

let cachedFingerprintData, cachedUUID
const uuidKey = 'rewards_uuid'

const browserPropsWhitelist = [
  'language',
  'platform',
  'screenResolution',
  'userAgent'
]

function fetchFingerprint() {
  return Fingerprint2.getPromise({}).then(components => {
    const values = components.map(component => component.value)
    const hash = `V1-${Fingerprint2.x64hash128(values.join(''), 31)}`

    // Select the browser properties to export along with the fingerprint.
    const browserProps = {}
    components
      .filter(x => browserPropsWhitelist.includes(x.key))
      .forEach(x => (browserProps[x.key] = x.value))
    cachedFingerprintData = { fingerprint: hash, ...browserProps }
  })
}

async function getLocalStorageUUID() {
  const uuid = localStorage.getItem(uuidKey)
  cachedUUID = uuid ? uuid : cachedUUID
}

async function getCookieUUID() {
  const cookie = document.cookie
    .split(';')
    .filter(cookie => cookie.split('=')[0] === uuidKey)[0]

  cachedUUID = cookie ? cookie.split('=')[1] : cachedUUID
}

async function storeUUID(uuid) {
  localStorage.setItem(uuidKey, uuid)
  document.cookie = `${uuidKey}=${uuid}; expires=18 Dec 2050 12:00:00 UTC`
}

async function getFingerprintFn(walletId) {
  await Promise.all([
    fetchFingerprint(),
    getLocalStorageUUID(),
    getCookieUUID()
  ])

  cachedUUID = cachedUUID === undefined ? walletId : cachedUUID

  if (cachedUUID) {
    cachedFingerprintData.uuid = cachedUUID
    storeUUID(cachedUUID)
  }
  return cachedFingerprintData
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
      } else if (typeof requestIdleCallback === 'function') {
        idleCallback = requestIdleCallback(async () =>
          setFingerprintData(await getFingerprint(props.wallet))
        )
      } else {
        timeout = setTimeout(
          async () => setFingerprintData(await getFingerprint(props.wallet)),
          500
        )
      }
      return function cleanup() {
        clearTimeout(timeout)
        if (typeof cancelIdleCallback === 'function') {
          cancelIdleCallback(idleCallback)
        }
      }
    })

    return <WrappedComponent {...props} fingerprintData={fingerprintData} />
  }
  return withWallet(WithFingerprint)
}

export default withFingerprint
