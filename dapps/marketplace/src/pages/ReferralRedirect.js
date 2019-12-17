import React, { useEffect, useState } from 'react'
import get from 'lodash/get'

import { withRouter } from 'react-router-dom'

import UserActivationLink from 'components/UserActivationLink'

const localStorageKey = 'growth_invite_code'

const ReferralRedirect = ({ match }) => {
  const inviteCode = get(match, 'params.inviteCode')
  const [redirect, setRedirect] = useState(false)

  useEffect(() => {
    if (inviteCode && inviteCode.length >= 7 && inviteCode.length <= 11) {
      localStorage.setItem(localStorageKey, inviteCode)
    } else {
      console.warn(`Skipping invalid invite code ${inviteCode}`)
    }
    setRedirect(true)
  }, [inviteCode])

  if (redirect) {
    return (
      <UserActivationLink forceRedirect location={{ pathname: '/campaigns' }} />
    )
  }

  return null
}

export default withRouter(ReferralRedirect)
