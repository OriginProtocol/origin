import { useState, useEffect } from 'react'
import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

function usePrintful(orderId) {
  const { config } = useConfig()
  const [order, setOrder] = useState()
  const [{ admin }] = useStateValue()

  useEffect(() => {
    async function fetchOrder() {
      const url = `${config.backend}/orders/${orderId}/printful`
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(url, { headers })
      const raw = await fetch(myRequest)

      const order = await raw.json()
      setOrder(order)
    }
    fetchOrder()
  }, [])

  return order
}

export default usePrintful
