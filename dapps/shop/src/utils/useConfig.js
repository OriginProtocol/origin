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
        const url = `${dataUrl()}config.json`
        console.debug(`Loading config from ${url}...`)
        const raw = await fetch(url)
        if (raw.ok) {
          config = await raw.json()

          let supportEmailPlain = config.supportEmail
          if (supportEmailPlain.match(/<([^>]+)>/)[1]) {
            supportEmailPlain = supportEmailPlain.match(/<([^>]+)>/)[1]
          }
          config.supportEmailPlain = supportEmailPlain
          const netConfig = config.networks[NetID] || {}
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
