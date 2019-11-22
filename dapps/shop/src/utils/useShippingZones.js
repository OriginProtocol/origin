import { useEffect, useState } from 'react'

import { useStateValue } from 'data/state'

import dataUrl from 'utils/dataUrl'

function useShippingZones() {
  const [{ shippingZones }, dispatch] = useStateValue()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchShippingZones() {
      setLoading(true)
      try {
        const raw = await fetch(`${dataUrl()}shipping.json`)
        const zones = await raw.json()
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
