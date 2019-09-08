import React from 'react'

const TextRow = ({ children, onSave, ...props }) => (
  <div className="form-group">
    <label>{children}</label>
    <input type="text" onBlur={() => onSave()} {...props} />
  </div>
)

export default TextRow
