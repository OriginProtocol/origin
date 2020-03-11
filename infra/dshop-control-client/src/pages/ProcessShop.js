import React, { useEffect, useState } from 'react'
import { Redirect, useParams, withRouter } from 'react-router-dom'
import axios from 'axios'

import store from '@/store'

const API_URL = process.env.API_URL || 'http://localhost:9011'

const ProcessShop = () => {
  const [redirectTo, setRedirectTo] = useState(false)
  const { url, dataurl } = useParams()

  useEffect(() => {
    const fetchData = async () => {
      let shopUrl
      if (dataurl) {
        // If we have the config URL
        shopUrl = `${API_URL}/slurp/${dataurl}`
      } else {
        // If we have the shop URL
        shopUrl = `${API_URL}/ingest/${url}`
      }
      const response = await axios.get(shopUrl)
      const { datadir, products, collections, config } = response.data
      if (datadir) {
        // Update the known shop config URL
        store.update(s => {
          s.dataURL = datadir
        })
      }
      store.update(s => {
        s.products = products
        s.collections = collections
        if (config) {
          s.settings = config
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
      Grabbing your shop data...
    </div>
  )
}

export default withRouter(ProcessShop)
