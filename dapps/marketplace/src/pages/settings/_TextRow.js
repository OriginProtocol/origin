import React from 'react'

const TextRow = ({ children, ...props }) => (
  <div className="form-group">
    <label>{children}</label>
    <input type="text" {...props} />
  </div>
)

export default TextRow
