import React, { useState } from 'react'

import Dropdown from 'components/Dropdown'

import { Currencies, CurrenciesByKey } from 'constants/Currencies'

const CurrencyDropdown = ({
  className,
  value,
  dropup,
  onChange,
  useNativeSelectbox
}) => {
  const [open, setOpen] = useState(false)

  if (useNativeSelectbox) {
    return (
      <select
        className={className}
        value={value}
        onChange={e => onChange(e.target.value)}
      >
        {Currencies.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    )
  }

  if (!CurrenciesByKey[value]) {
    value = Currencies[0][0]
  }
  const selected = (
    <div className="dropdown-selected">
      {`${CurrenciesByKey[value][2]} ${CurrenciesByKey[value][1]}`}
      <span className="arrow" />
    </div>
  )
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
        children={selected}
      />
    </Dropdown>
  )
}

export default CurrencyDropdown
