import React from 'react'

const VariantOptions = ({ variant, product }) => {
  const { options, variants } = product
  if (!options || variants.length <= 1) {
    return null
  }
  return (
    <div className="cart-options">
      {variant.options.map((opt, idx) => (
        <span key={idx}>{`${product.options[idx]}: ${opt}`}</span>
      ))}
    </div>
  )
}

export default VariantOptions
