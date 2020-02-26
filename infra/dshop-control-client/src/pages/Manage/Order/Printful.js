import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'
import { useStoreState } from 'pullstate'

import axios from 'utils/axiosWithCredentials'
import { Countries } from 'utils/countries'
import store from '@/store'

function generatePrintfulOrder(order, printfulIds) {
  const data = JSON.parse(order.data)

  const printfulData = {
    external_id: order.orderId,
    recipient: {
      name: `${data.userInfo.firstName} ${data.userInfo.lastName}`,
      address1: data.userInfo.address1,
      city: data.userInfo.city,
      state_name: data.userInfo.province,
      state_code: get(
        Countries,
        `[${data.userInfo.country}].provinces[${data.userInfo.province}].code`
      ),
      country_name: data.userInfo.country,
      country_code: get(Countries, `[${data.userInfo.country}].code`),
      zip: data.userInfo.zip
    },
    items: data.items.map(item => ({
      sync_variant_id: get(printfulIds, `[${item.product}][${item.variant}]`),
      quantity: item.quantity
    })),

    costs: {
      subtotal: (data.subTotal / 100).toFixed(2),
      discount: (data.discount / 100).toFixed(2),
      shipping: (data.shipping.amount / 100).toFixed(2),
      tax: '0.00',
      total: (data.total / 100).toFixed(2)
    }
  }
  return printfulData
}

const Printful = ({ order }) => {
  const backendConfig = useStoreState(store, s => s.backend)

  const [create, setCreate] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [printfulOrder, setPrintfulOrder] = useState(false)

  const match = useRouteMatch('/manage/orders/:orderId/:tab?')
  const { orderId } = match.params

  // TODO
  // printful ids were retrieved from the shop configuration
  // printful ids should be included in the order in case the shop
  // configuration changes and the printful ids are removed
  const { printfulIds } = []
  const printfulData = generatePrintfulOrder(order, printfulIds)

  /* Confirms a previously created printful order on the backend
   */
  const handlePrintfulConfirm = async () => {
    if (confirm) return
    setConfirm(true)
    const response = await axios.post(
      `${backendConfig.url}/orders/${orderId}/printful/confirm`
    )
    console.log(response)
  }

  /* Creates a printful order on the backend
   */
  const handlePrintfulCreate = async () => {
    if (create) return
    setCreate(true)
    const response = await axios.post(
      `${backendConfig.url}/orders/${orderId}/printful/create`,
      printfulData
    )
    setPrintfulOrder(response.data)
  }

  if (!order) {
    return <div>Order not found</div>
  }

  if (printfulOrder) {
    return (
      <div>
        {printfulOrder.status !== 'draft' ? null : (
          <button
            className={`btn btn-primary${confirm ? ' disabled' : ''}`}
            onClick={handlePrintfulConfirm}
          >
            Confirm Order
          </button>
        )}
        <pre>{JSON.stringify(printfulOrder, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div>
      <pre>{JSON.stringify(printfulData, null, 2)}</pre>
      <button
        className={`btn btn-primary${create ? ' disabled' : ''}`}
        onClick={handlePrintfulCreate}
      >
        Create Order
      </button>
    </div>
  )
}

export default Printful
