import React, { useState } from 'react'

import Dropdown from 'components/Dropdown'

import { Currencies, CurrenciesByKey } from 'constants/Currencies'

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
              children={`${cur[2]} ${cur[1]}`}
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
        children={`${CurrenciesByKey[value][2]} ${CurrenciesByKey[value][1]}`}
      />
    </Dropdown>
  )
}

export default CurrencyDropdown
