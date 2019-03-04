import React, { useState } from 'react'

import Languages from '../constants/Languages'
import Dropdown from 'components/Dropdown'

const LanguagesByKey = Languages.reduce((m, o) => {
  m[o[0]] = o[1]
  return m
}, {})

const LocaleDropdown = ({ className, locale, dropup, onLocale }) => {
  const [open, setOpen] = useState(false)
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
        children={LanguagesByKey[locale]}
      />
    </Dropdown>
  )
}

export default LocaleDropdown
