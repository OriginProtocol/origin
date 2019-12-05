import { useState, useEffect } from 'react'
import { useStateValue } from 'data/state'

const URL = process.env.BACKEND_URL

function usePrintful(orderId) {
  const [order, setOrder] = useState()
  const [{ admin }] = useStateValue()

  useEffect(() => {
    async function fetchOrder() {
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(`${URL}/orders/${orderId}/printful`, {
        headers
      })
      const raw = await fetch(myRequest)

      const order = await raw.json()
      setOrder(order)
    }
    fetchOrder()
  }, [])

  return order
}

export default usePrintful
