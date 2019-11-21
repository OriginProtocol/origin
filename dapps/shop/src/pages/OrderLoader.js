import React, { Suspense } from 'react'
const Order = React.lazy(() => import('./Order'))

const OrderLoader = () => (
  <Suspense fallback={<div className="loading-fullpage">Loading</div>}>
    <Order />
  </Suspense>
)

export default OrderLoader
