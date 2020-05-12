import React from 'react'

import Link from 'components/Link'
import CreateShop from './CreateShop'

const NewShop = () => {
  return (
    <>
      <h3 className="admin-title with-border">
        <Link to="/super-admin/shops" className="muted">
          Shops
        </Link>
        <span className="chevron" />
        {'New'}
      </h3>
      <div style={{ maxWidth: 400 }}>
        <CreateShop />
      </div>
    </>
  )
}

export default NewShop
