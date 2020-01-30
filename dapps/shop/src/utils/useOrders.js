import { useEffect, useState } from 'react'
import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

const { BACKEND_AUTH_TOKEN } = process.env

function useOrders() {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [{ orders }, dispatch] = useStateValue()

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const headers = new Headers({
        authorization: `bearer ${BACKEND_AUTH_TOKEN}`
      })
      const myRequest = new Request(`${config.backend}/orders`, {
        credentials: 'include',
        headers
      })
      const raw = await fetch(myRequest)
      const ordersRaw = await raw.json()
      const orders = ordersRaw.map(order => {
        return {
          ...order,
          data: JSON.parse(order.data)
        }
      })
      setLoading(false)

      dispatch({ type: 'setOrders', orders })
    }
    if (!orders.length) {
      fetchOrders()
    }
  }, [])

  return { orders, loading }
}

export default useOrders
