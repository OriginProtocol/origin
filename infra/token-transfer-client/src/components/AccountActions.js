import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import get from 'lodash.get'

import { apiUrl } from '@/constants'
import agent from '@/utils/agent'

const AccountActions = props => {
  const [redirectTo, setRedirectTo] = useState(false)

  const handleLogout = async () => {
    await agent.post(`${apiUrl}/api/logout`)
    setRedirectTo('/')
  }

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <div className="account-actions">
      {get(props.user, 'email')}
      <div className="separator">|</div>
      <a href="mailto:support@originprotocol.com">Contact Support</a>
      <div className="separator"></div>
      <a onClick={handleLogout} style={{ cursor: 'pointer' }}>
        Logout
      </a>
    </div>
  )
}

export default AccountActions

require('react-styl')(`
  .account-actions
    margin-bottom: 40px
    font-size: 14px
    text-align: right
    color: #638298
    .separator
      margin: 0 10px
      display: inline-block
    a
      color: #638298
`)
