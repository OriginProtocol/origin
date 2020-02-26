import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import { useToasts } from 'react-toast-notifications'

import ProductForm from 'components/Edit/ProductForm'
import store from '@/store'

const ProductEdit = () => {
  const { addToast } = useToasts()

  const products = useStoreState(store, s => s.products)
  const history = useHistory()

  const { productId } = useParams()
  const product = products[productId]

  const handleSave = updatedProduct => {
    store.update(s => {
      s.products = [
        ...products.slice(0, Number(productId)),
        updatedProduct,
        ...products.slice(Number(productId) + 1)
      ]
    })

    addToast('Product saved!', { appearance: 'success', autoDismiss: true })

    goBack()
  }

  const goBack = () => {
    if (history.length > 1) {
      history.goBack()
    } else {
      history.go('/edit/products')
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Edit Product</h3>
      </div>

      <a
        onClick={e => {
          e.preventDefault()
          goBack()
        }}
      >
        Back
      </a>

      {product && <ProductForm product={product} onSave={p => handleSave(p)} />}
    </>
  )
}

export default ProductEdit
