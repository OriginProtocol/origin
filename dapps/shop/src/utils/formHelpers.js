import React from 'react'

export const formInput = (state, setState, opts = {}) => (field, valueOnly) => {
  let className = 'form-control'
  if (opts.className) {
    className += ` ${opts.className}`
  }
  if (state[`${field}Error`]) {
    className += ' is-invalid'
  }
  return {
    value: state[field] || '',
    className,
    name: field,
    onChange: e =>
      setState({
        [field]: valueOnly ? e : e.target.value,
        [`${field}Error`]: false
      })
  }
}

export const formFeedback = state =>
  function InvalidFeedback(field) {
    return state[`${field}Error`] ? (
      <div className="invalid-feedback" style={{ display: 'block' }}>
        {state[`${field}Error`]}
      </div>
    ) : null
  }
