import React from 'react'

import EmailIcon from '@/assets/email-icon.svg'

const CheckEmail = () => (
  <div className="action-card">
    <h1>Check Your Email</h1>
    <img src={EmailIcon} className="my-5" />
    <p>
      If this was a valid email address, an email will be delivered within a few minutes.
      <br />
      Please click the link in the email to access your account.
    </p>
  </div>
)

export default CheckEmail
