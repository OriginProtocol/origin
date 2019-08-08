import React from 'react'
import { Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import { apiUrl } from '@/constants'
import { setSessionEmail } from '@/actions/session'
import agent from '@/utils/agent'

const AccountActions = props => {
  const handleLogout = async () => {
    agent.post(`${apiUrl}/api/logout`)
    await props.setSessionEmail(false)
  }

  if (!props.session.email) {
    return <Redirect to="/" />
  }

  return (
    <div className="account-actions">
      {props.session.email}
      <div className="separator">|</div>
      <a href="mailto:support@originprotocol.com">Contact Support</a>
      <div className="separator"></div>
      <a onClick={handleLogout}>Logout</a>
    </div>
  )
}

const mapStateToProps = ({ session }) => {
  return { session }
}

const mapDispatchToProps = dispatch => {
  return {
    setSessionEmail: email => dispatch(setSessionEmail(email))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AccountActions)

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
