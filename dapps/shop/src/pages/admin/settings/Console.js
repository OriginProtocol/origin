import React, { useState } from 'react'

import useConfig from 'utils/useConfig'

const AdminConsole = () => {
  const { config } = useConfig()
  const [encryptedData, setEncryptedData] = useState('')
  return (
    <div className="mt-4">
      <label>Manually create order from IPFS hash</label>
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
    </div>
  )
}

export default AdminConsole
