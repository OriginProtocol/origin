import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import { get } from 'lodash'
import axios from 'axios'

import Loading from 'components/Loading'
import store from '@/store'

const Complete = ({ ethNetworkId }) => {
  const [loading, setLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState(null)
  const [shopUrl, setShopUrl] = useState(false)

  const collections = useStoreState(store, s => s.collections)
  const products = useStoreState(store, s => s.products)
  const settings = useStoreState(store, s => s.settings)

  useEffect(() => {
    deploy()
  }, [])

  /* Create a shop on the DShop backend
   *
   */
  const createShop = async () => {
    const authToken = [...Array(30)]
      .map(() => Math.random().toString(36)[2])
      .join('')

    const response = await axios.post(`${settings.backend}/shop`, {
      name: settings.fullTitle,
      listingId: settings.networks[ethNetworkId].listingId,
      authToken
    })

    console.log(response)

    store.update(s => {
      s.settings = {
        ...s.settings,
        networks: {
          ...s.settings.networks[ethNetworkId],
          [ethNetworkId]: {
            ...s.settings.networks[ethNetworkId],
            shopId: response.data.shopId
          }
        }
      }
    })

    return response.data.shopId
  }

  /* Update the configuration for a shop on the DShop backend
   *
   */
  const updateShopConfig = async (shopId, dataUrl) => {
    return await axios.post(`${settings.backend}/shop`, {
      shopId,
      config: {
        dataUrl
      }
    })
  }

  const deploy = async () => {
    let shopId = get(settings, `networks[${ethNetworkId}].shopId`)
    if (!shopId) {
      shopId = await createShop()
    }

    const root = await uploadToIpfs()
    await updateShopConfig(`${root}/data`)

    setLoading(false)
  }

  const uploadToIpfs = async () => {
    // Put the shop on IPFS
    const response = await axios.post(`${process.env.API_URL}/deploy`, {
      settings,
      collections,
      products
    })

    const url = `${process.env.IPFS_GATEWAY_URL}/ipfs/${response.data}`
    setShopUrl(url)
    return url
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="my-5">
      <p>
        Great, you are done. Your DSHop has been deployed at{' '}
        <a href={shopUrl} target="_blank" rel="noopener noreferrer">
          {shopUrl}
        </a>
      </p>
      <div className="mt-5">
        <button
          onClick={() => setRedirectTo('/manage')}
          className="btn btn-lg btn-primary"
          disabled={loading}
        >
          Open Management Dashboard
        </button>
      </div>
    </div>
  )
}

export default Complete
