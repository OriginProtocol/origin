import { useEffect, useState } from 'react'

import { useStateValue } from 'data/state'

import useConfig from 'utils/useConfig'
import dataUrl from 'utils/dataUrl'

function useShippingZones() {
  const { config } = useConfig()
  const [{ shippingZones, cart }, dispatch] = useStateValue()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchShippingZones() {
      setLoading(true)
      let zones = []
      try {
        if (config.shippingApi) {
          const raw = await fetch(`${config.backend}/shipping`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              authorization: `bearer ${config.backendAuthToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              items: cart.items,
              recipient: cart.userInfo
            })
          })
          const json = await raw.json()
          if (json.success !== false) {
            zones = json
          }
        }

        if (!zones.length) {
          const raw = await fetch(`${dataUrl()}shipping.json`)
          zones = await raw.json()
        }

        setLoading(false)
        dispatch({ type: 'setShippingZones', zones })
      } catch (e) {
        setLoading(false)
        setError(true)
      }
    }
    if (!shippingZones.length) {
      fetchShippingZones()
    }
  }, [])

  return { shippingZones, loading, error }
}

export default useShippingZones
