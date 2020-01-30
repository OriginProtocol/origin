import React from 'react'
import { useHistory } from 'react-router-dom'
import { useToasts } from 'react-toast-notifications'

import ProductForm from 'components/ProductForm'
import store from '@/store'

const ProductAdd = () => {
  const { addToast } = useToasts()

  const history = useHistory()

  const handleSave = product => {
    store.update(s => {
      s.products.push(product)
    })

    addToast('Product added!', { appearance: 'success', autoDismiss: true })

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
        <h3>Add Product</h3>
      </div>

      <a
        onClick={e => {
          e.preventDefault()
          goBack()
        }}
      >
        Back
      </a>

      <ProductForm onSave={handleSave} />
    </>
  )
}

export default ProductAdd
