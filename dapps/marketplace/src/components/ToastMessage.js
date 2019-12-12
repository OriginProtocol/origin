import React, { useEffect } from 'react'

const ToastMessage = ({ message, type, onClose, timeout }) => {
  useEffect(() => {
    const _timeout = setTimeout(() => onClose(), timeout || 4000)

    return () => clearTimeout(_timeout)
  })

  return (
    <div className="toast-message-container">
      <div className={`alert alert-${type || 'info'}`}>{message}</div>
    </div>
  )
}

require('react-styl')(`
  .toast-message-container
    position: fixed
    top: 0
    left: 0
    right: 0
    padding: 1rem
    width: 100%
    z-index: 100000
    .alert
      padding-left: 2rem
      padding-right: 2rem
      margin: 0 auto
      max-width: 400px
      text-align: center
`)

export default ToastMessage
