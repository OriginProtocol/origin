import React, { Suspense } from 'react'
const Admin = React.lazy(() => import('./Admin'))

const AdminLoader = () => (
  <Suspense fallback={<div className="loading-fullpage">Loading</div>}>
    <Admin />
  </Suspense>
)

export default AdminLoader
