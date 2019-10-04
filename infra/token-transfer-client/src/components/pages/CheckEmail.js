import React from 'react'

import EmailIcon from '@/assets/email-icon.svg'

const CheckEmail = () => (
  <div className="action-card">
    <h1>Check your email</h1>
    <img src={EmailIcon} className="my-5" />
    <p>
      If you used a valid email we just sent you an email.
      <br />
      Please click the link in the email to proceed.
    </p>
  </div>
)

export default CheckEmail
