import { useEffect, useState } from 'react'

import { useStateValue } from 'data/state'

import dataUrl from 'utils/dataUrl'

function useProducts() {
  const [{ products, productIndex }, dispatch] = useStateValue()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const raw = await fetch(`${dataUrl()}products.json`)
        const products = await raw.json()
        setLoading(false)
        dispatch({ type: 'setProducts', products })
      } catch (e) {
        setLoading(false)
        setError(true)
      }
    }
    if (!products.length) {
      fetchProducts()
    }
  }, [])

  return { products, productIndex, loading, error }
}

export default useProducts
