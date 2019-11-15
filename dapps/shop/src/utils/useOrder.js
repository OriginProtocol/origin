import { useState, useEffect } from 'react'
import { useStateValue } from 'data/state'

const URL = process.env.BACKEND_URL

function useOrder(orderId) {
  const [order, setOrder] = useState()
  const [{ admin }] = useStateValue()

  useEffect(() => {
    async function fetchOrder() {
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(`${URL}/orders/${orderId}`, { headers })
      const raw = await fetch(myRequest)

      const order = await raw.json()
      order.data = JSON.parse(order.data)
      // console.log(order)
      setOrder(order)
    }
    fetchOrder()
  }, [])

  return order
}

export default useOrder
