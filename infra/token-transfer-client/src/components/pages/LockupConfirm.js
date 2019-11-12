import React, { useEffect, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { bindActionCreators } from 'redux'

import { confirmLockup } from '@/actions/lockup'

const LockupConfirm = props => {
  const [loading, setLoading] = useState(true)
  const [redirectTo, setRedirectTo] = useState(null)
  // API call to confirm a lockup if an id and token is present in the URL
  useEffect(() => {
    const confirmLockup = async () => {
      const lockupId = props.match.params.id
      const token = props.match.params.token
      if (lockupId && token) {
        let result
        try {
          result = await props.confirmLockup(lockupId, token)
        } catch (error) {
          setLoading(false)
        }
        if (result && result.type === 'CONFIRM_LOCKUP_SUCCESS') {
          setRedirectTo('/lockup')
        }
        setLoading(false)
      }
    }
    confirmLockup()
  }, [])

  if (redirectTo) {
    return <Redirect to={redirectTo} />
  }

  if (loading) {
    return (
      <div className="spinner-grow mb-3" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <div className="text-center p-5 text-muted">
      <h1>
        An error occurred confirming your token lockup, has the token expired?
      </h1>
    </div>
  )
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      confirmLockup: confirmLockup
    },
    dispatch
  )

export default withRouter(connect(null, mapDispatchToProps)(LockupConfirm))
