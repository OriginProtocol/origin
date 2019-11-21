import React, { Suspense } from 'react'
const Checkout = React.lazy(() => import('./Checkout'))

const Loader = () => (
  <Suspense fallback={<div className="loading-fullpage">Loading</div>}>
    <Checkout />
  </Suspense>
)

export default Loader

require('react-styl')(`
  .loading-fullpage
    min-height: 100vh
    display: flex
    align-items: center
    justify-content: center
`)
