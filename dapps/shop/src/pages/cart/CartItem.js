import React, { useState, useEffect } from 'react'

import Link from 'components/Link'
import VariantPic from 'components/VariantPic'

import fetchProduct from 'data/fetchProduct'
import { useStateValue } from 'data/state'

import formatPrice from 'utils/formatPrice'

const CartItem = ({ item, idx }) => {
  const [product, setProduct] = useState()
  const [, dispatch] = useStateValue()
  useEffect(() => {
    fetchProduct(item.product).then(setProduct)
  }, [item.product])

  if (!product) return null

  let variant = product.variants.find(v => v.id === item.variant)
  if (!variant) {
    variant = product
  }

  return (
    <>
      <div className="pic">
        <VariantPic variant={variant} product={product} />
      </div>
      <div className="title">
        <div>
          <Link
            to={{
              pathname: `/products/${product.id}`,
              search: item.variant ? `?variant=${item.variant}` : ''
            }}
          >
            {product.title}
          </Link>
        </div>
        {!variant.options || product.variants.length <= 1 ? null : (
          <div className="cart-options">
            {variant.options.map((opt, idx) => (
              <span key={idx}>{opt}</span>
            ))}
          </div>
        )}
        <div className="mt-2">
          <a
            href="#"
            onClick={e => {
              e.preventDefault()
              dispatch({ type: 'removeFromCart', item: idx })
            }}
          >
            Remove
          </a>
        </div>
      </div>
      <div className="price">{formatPrice(variant.price)}</div>
      <div className="quantity">
        <select
          className="form-control"
          value={item.quantity}
          onChange={e => {
            dispatch({
              type: 'updateCartQuantity',
              item: idx,
              quantity: Number(e.target.value)
            })
          }}
        >
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>5</option>
          <option>6</option>
          <option>7</option>
          <option>8</option>
          <option>9</option>
          <option>10</option>
        </select>
      </div>
      <div className="total">{formatPrice(item.quantity * variant.price)}</div>
    </>
  )
}

export default CartItem

require('react-styl')(`
`)
