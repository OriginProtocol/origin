import { useState, useEffect } from 'react'
import { useStateValue } from 'data/state'
import memoize from 'lodash/memoize'
import useConfig from 'utils/useConfig'

const getOrder = memoize(
  async function fetchOrder(admin, orderId, backend, authToken) {
    const headers = new Headers({
      authorization: `bearer ${authToken}`
    })
    const myRequest = new Request(`${backend}/orders/${orderId}`, {
      credentials: 'include',
      headers
    })
    const raw = await fetch(myRequest)

    const order = await raw.json()
    order.data = JSON.parse(order.data)

    return order
  },
  (...args) => args[1]
)

function useOrder(orderId) {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState()
  const [{ admin }] = useStateValue()

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true)
      const order = await getOrder(
        admin,
        orderId,
        config.backend,
        config.backendAuthToken
      )
      setLoading(false)
      setOrder(order)
    }
    fetchOrder()
  }, [orderId])

  return { loading, order }
}

export default useOrder
