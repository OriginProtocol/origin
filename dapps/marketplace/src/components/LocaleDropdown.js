import React, { useState } from 'react'

import Languages from '../constants/Languages'
import Dropdown from 'components/Dropdown'

const LanguagesByKey = Languages.reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

const LocaleDropdown = ({
  className,
  locale,
  dropup,
  onLocale,
  useNativeSelectbox
}) => {
  const [open, setOpen] = useState(false)

  if (useNativeSelectbox) {
    return (
      <select
        className={className}
        value={locale}
        onChange={e => onLocale(e.target.value)}
      >
        {Languages.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    )
  }

  const selected = (
    <div className="dropdown-selected">
      {LanguagesByKey[locale]}
      <span className="arrow" />
    </div>
  )
  return (
    <Dropdown
      className={dropup ? 'dropup' : 'dropdown'}
      content={
        <div className="dropdown-menu show">
          {Languages.map(lang => (
            <a
              className={`dropdown-item${lang[0] == locale ? ' active' : ''}`}
              key={lang[0]}
              title={lang[0]}
              href="#"
              onClick={e => {
                e.preventDefault()
                onLocale(lang[0])
                setOpen(false)
              }}
              children={lang[1]}
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

export default LocaleDropdown
