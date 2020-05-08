import React from 'react'
import get from 'lodash/get'

import { useStateValue } from 'data/state'

const SuperAdminDashboard = () => {
  const [{ admin }] = useStateValue()
  const network = get(admin, 'network', {})

  return (
    <>
      <div className="d-flex mb-3 align-items-center">
        <h3 className="m-0">Settings</h3>
      </div>
      <pre>{JSON.stringify(network, null, 4)}</pre>
    </>
  )
}

export default SuperAdminDashboard
