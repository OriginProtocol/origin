import { useEffect, useState } from 'react'
import { useStateValue } from 'data/state'

const { BACKEND_URL } = process.env

function useDiscounts() {
  const [loading, setLoading] = useState(false)
  const [{ discounts, admin }, dispatch] = useStateValue()

  useEffect(() => {
    async function fetchDiscounts() {
      setLoading(true)
      const headers = new Headers({ authorization: admin })
      const myRequest = new Request(`${BACKEND_URL}/discounts`, { headers })
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
