import React from 'react'
import { fbt } from 'fbt-runtime'

const SelectQuantity = ({ quantity, onChange, available }) => {
  return (
    <div className="quantity">
      <span>
        <fbt desc="quantity">Quantity</fbt>
      </span>
      <span>
        <select value={quantity} onChange={e => onChange(e.target.value)}>
          {Array(available)
            .fill(0)
            .map((v, idx) => (
              <option key={idx}>{idx + 1}</option>
            ))}
        </select>
      </span>
    </div>
  )
}

export default SelectQuantity
