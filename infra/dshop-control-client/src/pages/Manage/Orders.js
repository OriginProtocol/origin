import React, { useEffect } from 'react'
import axios from 'axios'

import store from '@/store'

const Orders = () => {
  const backendUrl = 'https://rinkebyapi.ogn.app'

  useEffect(() => {
    const fetchOrders = async () => {
      console.debug('Fetching orders...')
      const response = await axios.get(`${backendUrl}/orders`)
      console.log(response)
      store.update(s => (s.orders = response.data))
    }
    fetchOrders()
  }, [])

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Orders</h3>
        {/*
        <SortBy />
        */}
      </div>
    </>
  )
}

export default Orders

require('react-styl')(``)
