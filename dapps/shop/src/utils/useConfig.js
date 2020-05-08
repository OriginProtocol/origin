import { useEffect, useState } from 'react'

import dataUrl from 'utils/dataUrl'

const DefaultPaymentMethods = [
  { id: 'crypto', label: 'Crypto Currency' },
  { id: 'stripe', label: 'Credit Card' }
]

let config

function useConfig() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      config = { backend: '', firstTimeSetup: true }
      setLoading(true)
      try {
        const net = localStorage.ognNetwork || process.env.NETWORK
        const NetID = net === 'mainnet' ? '1' : net === 'rinkeby' ? '4' : '999'
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
          if (process.env.MARKETPLACE_CONTRACT) {
            netConfig.marketplaceContract = process.env.MARKETPLACE_CONTRACT
          }
          config = { ...config, ...netConfig, netId: NetID }
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
