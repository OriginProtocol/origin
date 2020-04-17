import React, { useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import useOrder from 'utils/useOrder'
import useConfig from 'utils/useConfig'
import usePrintfulIds from 'utils/usePrintfulIds'
import usePrintful from 'utils/usePrintful'
import { Countries } from 'data/Countries'

function generatePrintfulOrder(order, printfulIds, draft) {
  const data = order.data

  const printfulData = {
    draft,
    external_id: order.orderId,
    recipient: {
      name: `${data.userInfo.firstName} ${data.userInfo.lastName}`,
      phone: data.userInfo.phone,
      address1: data.userInfo.address1,
      address2: data.userInfo.address2,
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
    items: data.items
      .map(item => ({
        sync_variant_id: get(printfulIds, `[${item.product}][${item.variant}]`),
        quantity: item.quantity,
        retail_price: (item.price / 100).toFixed(2)
      }))
      .filter(i => i.sync_variant_id),

    retail_costs: {
      currency: 'USD',
      subtotal: (data.subTotal / 100).toFixed(2),
      discount: (data.discount / 100).toFixed(2),
      shipping: (data.shipping.amount / 100).toFixed(2),
      tax: '0.00',
      total: (data.total / 100).toFixed(2)
    }
  }
  return printfulData
}

const Printful = () => {
  const { config } = useConfig()
  const [create, setCreate] = useState(false)
  const [reload, setReload] = useState(1)
  const [confirm, setConfirm] = useState(false)
  const [draft, setDraft] = useState(false)
  const match = useRouteMatch('/admin/orders/:orderId/:tab?')
  const { orderId } = match.params
  const { order, loading } = useOrder(orderId)
  const { printfulIds } = usePrintfulIds()
  const printfulOrder = usePrintful(orderId, reload)

  if (loading) {
    return <div>Loading...</div>
  }
  if (!order) {
    return <div>Order not found</div>
  }

  const printfulData = generatePrintfulOrder(order, printfulIds, draft)

  if (printfulOrder) {
    return (
      <div className="mt-3">
        {printfulOrder.status !== 'draft' ? null : (
          <button
            className={`btn btn-primary${confirm ? ' disabled' : ''}`}
            onClick={async () => {
              if (confirm) {
                return
              }
              setConfirm(true)
              const headers = new Headers({
                authorization: `bearer ${config.backendAuthToken}`,
                'content-type': 'application/json'
              })
              const myRequest = new Request(
                `${config.backend}/orders/${orderId}/printful/confirm`,
                {
                  headers,
                  credentials: 'include',
                  method: 'POST'
                }
              )
              const raw = await fetch(myRequest)
              const json = await raw.json()
              console.log(json)
              setReload(reload + 1)
            }}
          >
            Confirm Order
          </button>
        )}
        <pre className="mt-3">{JSON.stringify(printfulOrder, null, 2)}</pre>
      </div>
    )
  }

  return (
    <div className="mt-3">
      <div className="d-flex align-items-center">
        <button
          className={`btn btn-primary${create ? ' disabled' : ''} mr-3`}
          onClick={async () => {
            if (create) {
              return
            }
            setCreate(true)
            const raw = await fetch(
              `${config.backend}/orders/${orderId}/printful/create`,
              {
                headers: {
                  authorization: `bearer ${config.backendAuthToken}`,
                  'content-type': 'application/json'
                },
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify(printfulData)
              }
            )
            const json = await raw.json()
            console.log(json)
            setReload(reload + 1)
          }}
        >
          Create Order
        </button>
        <label className="p-0 m-0 d-flex align-items-center">
          <input
            type="checkbox"
            className="mr-1"
            value={draft}
            onChange={() => setDraft(!draft)}
          />
          Draft only
        </label>
      </div>
      <pre className="mt-3">{JSON.stringify(printfulData, null, 2)}</pre>
    </div>
  )
}

export default Printful
