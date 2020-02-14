import { useEffect, useState } from 'react'
import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'
import sortBy from 'lodash/sortBy'

function useOrders() {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [{ orders, admin }, dispatch] = useStateValue()

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(`${config.backend}/orders`, { headers })
      const raw = await fetch(myRequest)
      const ordersRaw = await raw.json()
      const orders = ordersRaw.map(order => {
        return {
          ...order,
          data: JSON.parse(order.data)
        }
      })
      const sortedOrders = sortBy(orders, order => {
        return -Number(order.order_id.split('-')[3])
      })

      setLoading(false)

      dispatch({ type: 'setOrders', orders: sortedOrders })
    }
    if (!orders.length) {
      fetchOrders()
    }
  }, [])

  return { orders, loading }
}

export default useOrders
