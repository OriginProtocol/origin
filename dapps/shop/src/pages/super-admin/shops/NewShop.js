import React from 'react'
import { useHistory } from 'react-router-dom'

import { useStateValue } from 'data/state'
import Link from 'components/Link'
import CreateShop from './CreateShop'

const NewShop = () => {
  const history = useHistory()
  const [, dispatch] = useStateValue()
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
        <CreateShop
          next={() => {
            dispatch({ type: 'reload', target: 'auth' })
            history.push('/super-admin/shops')
          }}
        />
      </div>
    </>
  )
}

export default NewShop
