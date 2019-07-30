import React from 'react'

const AccountActions = () => (
  <div className="account-actions">
    Aure Gimon
    <div className="separator">|</div>
    <a href="mailto:support@originprotocol.com">Contact Support</a>
    <div className="separator"></div>
    <a href="">Logout</a>
  </div>
)

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
