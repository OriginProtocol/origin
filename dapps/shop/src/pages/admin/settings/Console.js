import React, { useState } from 'react'
import { get } from '@origin/ipfs'

import useConfig from 'utils/useConfig'
import useShopConfig from 'utils/useShopConfig'

const AdminConsole = () => {
  const { config } = useConfig()
  const { shopConfig } = useShopConfig()
  const [encryptedData, setEncryptedData] = useState('')
  const [orderId, setOrderId] = useState('')
  const [readHash, setReadHash] = useState('')

  return (
    <div className="mt-4">
      <label className="font-weight-bold">Create order via IPFS hash</label>
      <form
        className="d-flex"
        onSubmit={e => {
          e.preventDefault()
          if (!encryptedData) {
            return
          }

          fetch(`${config.ipfsGateway}/ipfs/${encryptedData}`).then(res => {
            if (!res.ok) {
              console.log('Not OK')
              return
            }

            fetch(`${config.backend}/orders/create`, {
              headers: {
                authorization: `bearer ${config.backendAuthToken}`,
                'content-type': 'application/json'
              },
              credentials: 'include',
              method: 'POST',
              body: JSON.stringify({ encryptedData })
            }).then(saveRes => {
              if (!saveRes.ok) {
                console.log('Not OK')
                return
              }
              console.log('Saved OK')
            })
          })
        }}
      >
        <input
          className="form-control"
          placeholder="Encrypted IPFS Hash"
          style={{ maxWidth: 300 }}
          value={encryptedData}
          onChange={e => setEncryptedData(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
      <label className="mt-4 font-weight-bold">Send confirmation email</label>
      <form
        className="d-flex"
        onSubmit={e => {
          e.preventDefault()
          if (!orderId) {
            return
          }

          fetch(`${config.backend}/orders/${orderId}/email`, {
            headers: {
              authorization: `bearer ${config.backendAuthToken}`,
              'content-type': 'application/json'
            },
            credentials: 'include',
            method: 'POST'
          }).then(saveRes => {
            if (!saveRes.ok) {
              console.log('Not OK')
              return
            }
            console.log('OK')
          })
        }}
      >
        <input
          className="form-control"
          placeholder="Order ID"
          style={{ maxWidth: 300 }}
          value={orderId}
          onChange={e => setOrderId(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
      <label className="mt-4 font-weight-bold">Read encrypted hash</label>
      <form
        className="d-flex"
        onSubmit={async e => {
          e.preventDefault()
          if (!readHash) {
            return
          }

          const encryptedData = await get(config.ipfsGateway, readHash, 10000)

          const privateKey = await openpgp.key.readArmored(shopConfig.pgpPrivateKey)
          if (privateKey.err && privateKey.err.length) {
            throw privateKey.err[0]
          }
          const privateKeyObj = privateKey.keys[0]
          await privateKeyObj.decrypt(shopConfig.pgpPrivateKeyPass)

          const message = await openpgp.message.readArmored(encryptedData.data)
          const options = { message, privateKeys: [privateKeyObj] }

          const decrypted = await openpgp.decrypt(options)

          console.log(JSON.parse(decrypted.data))
        }}
      >
        <input
          className="form-control"
          placeholder="IPFS Hash"
          style={{ maxWidth: 300 }}
          value={readHash}
          onChange={e => setReadHash(e.target.value)}
        />
        <button type="submit" className="btn btn-outline-primary ml-3">
          Submit
        </button>
      </form>
    </div>
  )
}

export default AdminConsole
