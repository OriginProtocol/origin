import { useEffect, useState } from 'react'
import { useStateValue } from 'data/state'
import useConfig from 'utils/useConfig'

function useDiscounts() {
  const { config } = useConfig()
  const [loading, setLoading] = useState(false)
  const [{ discounts }, dispatch] = useStateValue()

  useEffect(() => {
    async function fetchDiscounts() {
      setLoading(true)
      const headers = new Headers({
        authorization: `bearer ${config.backendAuthToken}`
      })
      const myRequest = new Request(`${config.backend}/discounts`, {
        headers,
        credentials: 'include'
      })
      const raw = await fetch(myRequest)
      const discounts = await raw.json()
      setLoading(false)

      dispatch({ type: 'setDiscounts', discounts })
    }
    if (!discounts.length) {
      fetchDiscounts()
    }
  }, [])

  return { discounts, loading }
}

export default useDiscounts
