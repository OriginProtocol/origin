import React from 'react'
import sortBy from 'lodash/sortBy'

const ProvinceSelect = ({ country, value, onChange, className }) => {
  if (!country || !country.provinces) {
    return null
  }

  const provinces = sortBy(
    Object.keys(country.provinces).map(p => ({
      code: p.code,
      title: p
    })),
    'title'
  )

  return (
    <select value={value} onChange={onChange} className={className}>
      {provinces.map((c, idx) => (
        <option key={`${c.code}-${idx}`} data-code={c.code} value={c.title}>
          {c.title}
        </option>
      ))}
    </select>
  )
}

export default ProvinceSelect
