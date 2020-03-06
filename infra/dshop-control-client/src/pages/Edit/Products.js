import React from 'react'
import { Link } from 'react-router-dom'
import { useStoreState } from 'pullstate'

import usePaginate from 'utils/usePaginate'
// import useSearchQuery from 'utils/useSearchQuery'
import Paginate from 'components/Paginate'
// import SortBy from 'components/SortBy'
import formatPrice from 'utils/formatPrice'
// import sortProducts from 'utils/sortProducts'
import store from '@/store'

const Products = () => {
  const products = useStoreState(store, s => s.products)
  const { start, end } = usePaginate()
  const pagedProducts = products.slice(start, end)

  const handleDelete = (event, productId) => {
    event.preventDefault()
    const result = confirm('Are you sure you want to delete this product?')
    if (result) {
      store.update(s => {
        s.products = [
          ...s.products.slice(0, productId),
          ...s.products.slice(productId + 1)
        ]

        s.collections = s.collections.map(collection => ({
          ...collection,
          // Remove matching id, shift every subsequent id down by one, and
          // remove duplicates
          products: [
            ...new Set(
              collection.products
                .filter(id => id !== productId)
                .map(i => {
                  return i > productId ? i - 1 : i
                })
            )
          ]
        }))
      })
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Products</h3>
        {/*
        <SortBy />
        */}
      </div>
      <Link to="/edit/products/add">
        <button className="btn btn-lg btn-primary my-4">Add Product</button>
      </Link>
      {pagedProducts.length > 0 ? (
        <table className="table table-condensed table-bordered table-striped products">
          <thead>
            <tr>
              <th width="60%">Title</th>
              <th>Price</th>
              <th width="100"></th>
              <th width="100"></th>
            </tr>
          </thead>
          <tbody>
            {pagedProducts.map((product, i) => (
              <tr key={i}>
                <td>{product.title}</td>
                <td>{formatPrice(product.price)}</td>
                <td>
                  <Link to={`/edit/products/edit/${start + i}`}>Edit</Link>
                </td>
                <td>
                  <a href="#" onClick={e => handleDelete(e, start + i)}>
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-muted text-center bg-light rounded">
          You don&apos;t have any products yet
        </div>
      )}

      <Paginate total={products.length} />
    </>
  )
}

export default Products

require('react-styl')(`
.products
  tr
    td:first-child
      width: 80px
  .pic
    width: 60px
    height: 50px
    background-size: contain
    background-repeat: no-repeat
    background-position: center
`)
