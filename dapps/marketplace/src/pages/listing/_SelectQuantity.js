import React from 'react'

const SelectQuantity = ({ quantity, onChange, available }) => {
  return (
    <div className="quantity">
      <span>Quantity</span>
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
