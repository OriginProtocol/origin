import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import get from 'lodash.get'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

const AccountActions = props => {
  const [redirectTo, setRedirectTo] = useState(false)

  const handleLogout = async () => {
    await agent.post(`${apiUrl}/api/logout`)
    setRedirectTo('/login')
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="text-right" style={{ color: '#638298' }}>
      <small>
        {get(props.user, 'email')}
        <div className="mx-3 d-inline-block">|</div>
        <a className="text-muted" href="mailto:support@originprotocol.com">
          Contact Support
        </a>
        <div className="mx-2 d-inline-block"></div>
        <a className="text-muted pointer" onClick={handleLogout}>
          Logout
        </a>
      </small>
    </div>
  )
}

export default AccountActions
