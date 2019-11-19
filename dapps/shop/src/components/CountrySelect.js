import React from 'react'
import sortBy from 'lodash/sortBy'

import { Countries } from 'data/Countries'

const CountrySelect = ({ className, value, onChange }) => {
  const countries = sortBy(
    Object.keys(Countries).map(c => ({
      code: c.code,
      title: c
    })),
    'title'
  )
  return (
    <select
      value={value}
      onChange={onChange}
      className={className}
      autoComplete="shipping country"
      name="checkout[shipping_address][country]"
    >
      <option data-code="US" value="United States">
        United States
      </option>
      <option disabled="disabled" value="---">
        ---
      </option>
      {countries.map((c, idx) => (
        <option key={`${c.code}-${idx}`} data-code={c.code} value={c.title}>
          {c.title}
        </option>
      ))}
    </select>
  )
}

export default CountrySelect
