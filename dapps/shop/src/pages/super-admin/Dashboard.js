import React from 'react'
import get from 'lodash/get'

import { useStateValue } from 'data/state'

const SuperAdminDashboard = () => {
  const [{ admin }] = useStateValue()
  const shops = get(admin, 'shops', [])
  const network = get(admin, 'network', {})

  return (
    <>
      <div className="d-flex mb-3 align-items-center">
        <h3 className="m-0">Dashboard</h3>
      </div>
      <div className="admin-dashboard-stats">
        <div>
          <div>Active Network ID</div>
          <div>{network.networkId}</div>
        </div>
        <div>
          <div>Total shops</div>
          <div>{shops.length}</div>
        </div>
      </div>
    </>
  )
}

export default SuperAdminDashboard
