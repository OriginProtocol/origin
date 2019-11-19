import { useEffect } from 'react'
import { useStateValue } from 'data/state'

const { BACKEND_URL } = process.env

function useOrders() {
  const [{ orders, admin }, dispatch] = useStateValue()

  useEffect(() => {
    async function fetchOrders() {
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(`${BACKEND_URL}/orders`, { headers })
      const raw = await fetch(myRequest)
      const ordersRaw = await raw.json()
      const orders = ordersRaw.map(order => {
        return {
          ...order,
          data: JSON.parse(order.data)
        }
      })

      dispatch({ type: 'setOrders', orders })
    }
    if (!orders.length) {
      fetchOrders()
    }
  }, [])

  return orders
}

export default useOrders
