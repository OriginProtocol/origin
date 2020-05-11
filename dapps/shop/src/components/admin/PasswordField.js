import React, { useState } from 'react'

const PasswordField = ({ input, field }) => {
  const [hide, setHide] = useState(true)
  return (
    <div className="input-group">
      <input type={hide ? 'password' : 'text'} {...input(field)} />
      <div className="input-group-append">
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setHide(!hide)}
          children={hide ? '🔒' : '🔓'}
        />
      </div>
    </div>
  )
}

export default PasswordField