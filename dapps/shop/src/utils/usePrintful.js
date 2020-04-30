import { useState, useEffect } from 'react'
import useConfig from 'utils/useConfig'

function usePrintful(orderId, reload) {
  const { config } = useConfig()
  const [order, setOrder] = useState()
  const [loading, setLoading] = useState()

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      const url = `${config.backend}/orders/${orderId}/printful`
      const raw = await fetch(url, {
        credentials: 'include',
        headers: {
          authorization: `bearer ${config.backendAuthToken}`
        }
      })
      if (raw.ok) {
        const order = await raw.json()
        if (order !== 'Not Found') {
          setOrder(order)
        }
      }
      setLoading(false)
    }
    fetchOrder()
  }, [reload])

  return { order, loading }
}

export default usePrintful
