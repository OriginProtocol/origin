import React, { useState, useEffect } from 'react'

import VariantPic from 'components/VariantPic'
import VariantOptions from 'components/VariantOptions'

import formatPrice from 'utils/formatPrice'
import fetchProduct from 'data/fetchProduct'

const CartItem = ({ item }) => {
  const [product, setProduct] = useState()
  useEffect(() => {
    fetchProduct(item.product).then(setProduct)
  }, [item.product])

  if (!product) return null

  let variant = product.variants.find(v => v.id === item.variant)
  if (!variant) {
    variant = product
  }

  return (
    <div className="item">
      <div className="image">
        <VariantPic variant={variant} product={product} />
        <span>{item.quantity}</span>
      </div>
      <div className="title">
        <div>{product.title}</div>
        <VariantOptions variant={variant} product={product} />
      </div>
      <div className="price">{formatPrice(item.quantity * variant.price)}</div>
    </div>
  )
}

export default CartItem
