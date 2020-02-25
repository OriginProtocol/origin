import { useState, useEffect } from 'react'
import { useStateValue } from 'data/state'
import memoize from 'lodash/memoize'
import useConfig from 'utils/useConfig'

const { BACKEND_AUTH_TOKEN } = process.env

const getShopConfig = memoize(
  async function fetchOrder(backend) {
    const headers = new Headers({
      authorization: `bearer ${BACKEND_AUTH_TOKEN}`
    })
    const myRequest = new Request(`${backend}/config`, {
      credentials: 'include',
      headers
    })
    const raw = await fetch(myRequest)
    const result = await raw.json()

    return result.config
  },
  (...args) => args[1]
)

function useShopConfig() {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [shopConfig, setShopConfig] = useState()
  const [{ admin }] = useStateValue()

  useEffect(() => {
    async function fetchConfig() {
      setLoading(true)
      const shopConfig = await getShopConfig(config.backend)
      setLoading(false)
      setShopConfig(shopConfig)
    }
    fetchConfig()
  }, [])

  return { loading, shopConfig }
}

export default useShopConfig
