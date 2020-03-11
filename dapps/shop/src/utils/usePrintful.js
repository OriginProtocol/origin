import { useState, useEffect } from 'react'
import useConfig from 'utils/useConfig'

function usePrintful(orderId) {
  const { config } = useConfig()
  const [order, setOrder] = useState()

  useEffect(() => {
    async function fetchOrder() {
      const url = `${config.backend}/orders/${orderId}/printful`
      const headers = new Headers({
        authorization: `bearer ${config.backendAuthToken}`
      })
      const myRequest = new Request(url, {
        credentials: 'include',
        headers
      })
      const raw = await fetch(myRequest)
      if (raw.ok) {
        const order = await raw.json()
        if (order !== 'Not Found') {
          setOrder(order)
        }
      }
    }
    fetchOrder()
  }, [])

  return order
}

export default usePrintful
