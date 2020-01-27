import React, { useEffect, useState } from 'react'
import { Redirect, useParams, withRouter } from 'react-router-dom'
import axios from 'axios'

import store from '@/store'

const API_URL = process.env.API_URL || 'http://localhost:3000'

const ProcessShopify = () => {
  const [redirectTo, setRedirectTo] = useState(false)
  const { url } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      const shopifyData = await axios.get(`${API_URL}/ingest/${url}`)
      store.update(s => {
        s.products = shopifyData.data.products
        s.collections = shopifyData.data.collections
      })
      setRedirectTo('/dashboard')
    }
    fetchData()
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  return (
    <div className="loading text-center">
      <div className="p-5 d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
      Grabbing your Shopify data...
    </div>
  )
}

export default withRouter(ProcessShopify)
