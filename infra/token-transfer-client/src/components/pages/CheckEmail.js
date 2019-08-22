import React from 'react'

import EmailIcon from '@/assets/email-icon.svg'

const CheckEmail = () => (
  <div className="action-card">
    <h1>Check your email</h1>
    <img src={EmailIcon} style={{ margin: '40px 0' }} />
    <p>
      We just sent you an email.
      <br />
      Please click the link in the email to proceed.
    </p>
  </div>
)

export default CheckEmail
