import { useEffect, useState } from 'react'

import dataUrl from 'utils/dataUrl'

const { NETWORK } = process.env
const NetID = NETWORK === 'mainnet' ? '1' : NETWORK === 'rinkeby' ? '4' : '999'

const DefaultPaymentMethods = [
  {
    id: 'crypto',
    label: 'Crypto Currency'
  },
  {
    id: 'stripe',
    label: 'Credit Card'
  }
]

const { BACKEND_AUTH_TOKEN } = process.env

let config

function useConfig() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      try {
        const url = `${dataUrl()}config.json`
        console.debug(`Loading config from ${url}...`)
        const raw = await fetch(url)
        if (raw.ok) {
          config = await raw.json()
          if (!config.paymentMethods) {
            config.paymentMethods = DefaultPaymentMethods
          }
          let supportEmailPlain = config.supportEmail
          if (supportEmailPlain.match(/<([^>]+)>/)[1]) {
            supportEmailPlain = supportEmailPlain.match(/<([^>]+)>/)[1]
          }
          config.supportEmailPlain = supportEmailPlain
          const netConfig = config.networks[NetID] || {}
          config = { ...config, ...netConfig, netId: NetID }
          if (BACKEND_AUTH_TOKEN) {
            config.backendAuthToken = BACKEND_AUTH_TOKEN
          }
        } else {
          console.error(`Loading of config failed from ${url}`)
        }

        setLoading(false)
      } catch (e) {
        console.error(e)
        setLoading(false)
        setError(true)
      }
    }
    if (config === undefined) {
      fetchConfig()
    }
  }, [])

  return { config, loading, error }
}

export default useConfig
