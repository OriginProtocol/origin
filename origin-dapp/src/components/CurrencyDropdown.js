import React, { useState } from 'react'

import Dropdown from 'components/Dropdown'

const Currencies = [
  ['as-listed', 'As Listed'],
  ['fiat-USD', '$ USD'],
  ['fiat-GBP', '£ GBP'],
  ['fiat-EUR', '€ EUR'],
]
const CurrenciesByKey = Currencies.reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

const CurrencyDropdown = ({ className, value, dropup, onChange }) => {
  const [open, setOpen] = useState(false)
  if (!CurrenciesByKey[value]) {
    value = Currencies[0][0]
  }
  return (
    <Dropdown
      className={dropup ? 'dropup' : 'dropdown'}
      content={
        <div className="dropdown-menu show">
          {Currencies.map(cur => (
            <a
              className={`dropdown-item${cur[0] == value ? ' active' : ''}`}
              key={cur[0]}
              title={cur[0]}
              href="#"
              onClick={e => {
                e.preventDefault()
                onChange(cur[0])
                setOpen(false)
              }}
              children={cur[1]}
            />
          ))}
        </div>
      }
      open={open}
      onClose={() => setOpen(false)}
    >
      <a
        href="#"
        className={className}
        onClick={e => {
          e.preventDefault()
          setOpen(!open)
        }}
        children={CurrenciesByKey[value]}
      />
    </Dropdown>
  )
}

export default CurrencyDropdown
