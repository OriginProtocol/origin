import { useEffect, useState } from 'react'

import dataUrl from 'utils/dataUrl'

const { NETWORK } = process.env
const NetID = NETWORK === 'mainnet' ? '1' : NETWORK === 'rinkeby' ? '4' : '999'

let config

function useConfig() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      try {
        const raw = await fetch(`${dataUrl()}config.json`)
        if (raw.ok) {
          config = await raw.json()

          let supportEmailPlain = config.supportEmail
          if (supportEmailPlain.match(/<([^>]+)>/)[1]) {
            supportEmailPlain = supportEmailPlain.match(/<([^>]+)>/)[1]
          }
          config.supportEmailPlain = supportEmailPlain
          const netConfig = config.networks[NetID] || {}
          config = { ...config, ...netConfig, netId: NetID }
        }

        setLoading(false)
      } catch (e) {
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
