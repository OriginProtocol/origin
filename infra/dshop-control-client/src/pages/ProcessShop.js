import React, { useEffect, useState } from 'react'
import { Redirect, useParams, withRouter } from 'react-router-dom'
import axios from 'axios'

import store from '@/store'

const API_URL = process.env.API_URL || 'http://localhost:3000'

const ProcessShop = () => {
  const [redirectTo, setRedirectTo] = useState(false)
  const { url, datadir } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      const shopUrl = `${API_URL}/ingest/${url}`
      const response = await axios.get(shopUrl)
      store.update(s => {
        s.products = response.data.products
        s.collections = response.data.collections
        if (response.data.config) {
          s.settings = response.data.config
        }
        setRedirectTo('/edit')
      })
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
      {datadir
        ? 'Grabbing your DShop data...'
        : 'Grabbing your Shopify data...'}
    </div>
  )
}

export default withRouter(ProcessShop)
