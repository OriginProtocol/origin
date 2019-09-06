import React from 'react'

import Toggle from 'components/Toggle'

const ToggleRow = ({ children, field, config }) => {
  let value = config[field] ? true : false
  if (localStorage[field] === 'true') {
    value = true
  } else if (localStorage[field] === 'false') {
    value = false
  }
  return (
    <div className="form-group">
      <label>{children}</label>
      <Toggle
        value={value}
        onChange={on => {
          localStorage[field] = on ? 'true' : 'false'
          window.location.reload()
        }}
      />
    </div>
  )
}

export default ToggleRow
