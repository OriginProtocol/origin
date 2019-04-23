import React, { useState } from 'react'

import Dropdown from 'components/Dropdown'
import { Currencies, CurrenciesByKey } from 'constants/Currencies'

const CurrencySelect = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  if (!CurrenciesByKey[value]) {
    value = Currencies[0][0]
  }
  if (!onChange) {
    return (
      <div className="currency-select-dropdown usd">
        <span data-content={CurrenciesByKey[value][2]}>
          {CurrenciesByKey[value][1]}
        </span>
      </div>
    )
  }
  return (
    <Dropdown
      className="currency-select-dropdown usd"
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
      <span
        className="hover"
        data-content={CurrenciesByKey[value][2]}
        onClick={e => {
          e.preventDefault()
          setOpen(!open)
        }}
        children={CurrenciesByKey[value][1]}
      >
        {CurrenciesByKey[value][1]} <i />
      </span>
    </Dropdown>
  )
}

export default CurrencySelect

require('react-styl')(`
  .currency-select-dropdown
    position: absolute;
    right: 10px;
    top: 12px;
    font-weight: bold;
    font-size: 14px;
    span
      padding: 4px 12px 4px 12px;
      border-radius: 16px;
      background: var(--pale-grey);
      background-repeat: no-repeat;
      background-position: 6px center;
      background-size: 17px;
      color: var(--steel)

      i
        position: relative
        display: inline-block
        // height should be double border
        height: 12px
        vertical-align: -4px
        margin: 0 8px 0 2px
        &:before,&:after
          position: absolute
          display: block
          content: ""
          // adjust size
          border: 6px solid transparent;
        &:before
          top: 0
          // color
          border-top-color: var(--steel)
        &:after
          // thickness
          top: -3px;
          // background color
          border-top-color: var(--pale-grey);
      &.hover:hover i:before
        border-top-color: var(--pale-grey)
      &.hover:hover i:after
        border-top-color: var(--steel)

      &::before
        content: attr(data-content);
        margin-right: 0.25rem;
        background-color: var(--steel);
        color: var(--white);
        width: 18px;
        display: inline-block;
        border-radius: 1rem;
        line-height: 18px;
        text-align: center;
        font-weight: bold;
        font-size: 14px;
      &.hover:hover
        cursor: pointer
        background-color: var(--steel);
        color: var(--white)
        &::before
          background-color: var(--white);
          color: var(--steel);

`)
