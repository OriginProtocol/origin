import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStoreState } from 'pullstate'
import { get } from 'lodash'

import store from '@/store'

const CollectionForm = ({ collection = {}, onSave }) => {
  const products = useStoreState(store, s => s.products)

  const [title, setTitle] = useState(collection.title || '')
  const [collectionProducts, setCollectionProducts] = useState(
    collection.products || []
  )
  const [addingProduct, setAddingProduct] = useState(false)
  const [selectRef, setSelectRef] = useState(null)

  const handleAddProduct = productId => {
    setCollectionProducts([...collectionProducts, Number(productId)])
    setAddingProduct(false)
  }

  const handleDeleteProduct = (event, productId) => {
    event.preventDefault()
    const result = confirm(
      'Are you sure you want to delete this product from the collection?'
    )
    if (result) {
      setCollectionProducts([
        ...collectionProducts.filter(i => i !== productId)
      ])
    }
  }

  return (
    <form
      className="mt-3"
      onSubmit={event => {
        event.preventDefault()
        onSave({ title, products: collectionProducts })
      }}
    >
      <div className="form-group">
        <label>Collection Title</label>
        <input
          className="form-control"
          onChange={e => setTitle(e.target.value)}
          value={title}
        />
      </div>
      {collectionProducts.length > 0 || addingProduct ? (
        <table className="table table-condensed table-striped table-bordered">
          <thead>
            <tr>
              <th width="80%">Product Title</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {collectionProducts.map(productId => (
              <tr key={productId}>
                <td>{get(products[productId], 'title', productId)}</td>
                <td>
                  <Link to={`/dashboard/products/edit/${productId}`}>
                    Edit Product
                  </Link>
                </td>
                <td>
                  <a
                    href="#"
                    onClick={event => handleDeleteProduct(event, productId)}
                  >
                    Delete
                  </a>
                </td>
              </tr>
            ))}
            {addingProduct && (
              <tr>
                <td>
                  <div className="input-group">
                    <select
                      className="form-control custom-select"
                      ref={setSelectRef}
                    >
                      {products
                        .map((product, productId) => {
                          return collectionProducts.includes(
                            productId
                          ) ? null : (
                            <option value={productId} key={productId}>
                              {product.title}
                            </option>
                          )
                        })
                        .filter(e => e !== null)}
                    </select>
                    <div className="input-group-append">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => handleAddProduct(selectRef.value)}
                      >
                        Add
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setAddingProduct(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </td>
                <td></td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-center bg-light rounded">
          This collection has no products in it
        </div>
      )}
      <button
        className="btn btn-sm btn-secondary mt-3"
        disabled={products.length === 0 || addingProduct}
        onClick={() => setAddingProduct(true)}
      >
        Add Product to Collection
      </button>
      <div className="mt-5">
        <button type="submit" className="btn btn-lg btn-primary">
          Save Collection
        </button>
      </div>
    </form>
  )
}

export default CollectionForm
