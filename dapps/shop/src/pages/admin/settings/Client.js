import React from 'react'

import useConfig from 'utils/useConfig'

const AdminClientSettings = () => {
  const { config } = useConfig()
  return (
    <>
      <h4 className="mt-3">Contents of config.json on IPFS</h4>
      <pre>{JSON.stringify(config, null, 2)}</pre>
    </>
  )
}

export default AdminClientSettings
