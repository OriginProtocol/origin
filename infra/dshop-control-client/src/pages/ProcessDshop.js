import React, { useEffect, useState } from 'react'
import { Redirect, useParams, withRouter } from 'react-router-dom'
import axios from 'axios'
import queryString from 'query-string'

import store from '@/store'

const API_URL = process.env.API_URL || 'http://localhost:3000'

const ProcessDshop = () => {
  const [redirectTo, setRedirectTo] = useState(false)
  const { url } = useParams()

  const parsedQueryString = queryString.parse(location.search)

  useEffect(() => {
    const fetchData = async () => {
      const dShopData = await axios.get(
        `${API_URL}/ingest/${url}?datadir=${parsedQueryString.datadir}`
      )
      store.update(s => {
        s.products = dShopData.data.products
        s.collections = dShopData.data.collections
        s.config = dShopData.config
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
      Grabbing your dShop data...
    </div>
  )
}

export default withRouter(ProcessDshop)
