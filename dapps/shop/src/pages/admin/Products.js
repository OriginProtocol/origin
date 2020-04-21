import React from 'react'

import useProducts from 'utils/useProducts'
import usePaginate from 'utils/usePaginate'
import useSearchQuery from 'utils/useSearchQuery'

import Paginate from 'components/Paginate'
import SortBy from 'components/SortBy'
import dataUrl from 'utils/dataUrl'
import formatPrice from 'utils/formatPrice'
import sortProducts from 'utils/sortProducts'

const AdminProducts = () => {
  const { products } = useProducts()
  const { start, end } = usePaginate()
  const opts = useSearchQuery()

  const sortedProducts = sortProducts(products, opts.sort)
  const pagedProducts = sortedProducts.slice(start, end)

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h3 className="m-0">Products</h3>
        <SortBy />
      </div>
      <table className="table admin-products">
        <tbody>
          {pagedProducts.map(product => (
            <tr key={product.id}>
              <td>
                <div
                  className="pic"
                  style={{
                    backgroundImage: `url(${dataUrl()}${product.id}/520/${
                      product.image
                    })`
                  }}
                />
              </td>
              <td>
                <div className="title">{product.title}</div>
                <div className="price">{formatPrice(product.price)}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Paginate total={products.length} />
    </>
  )
}

export default AdminProducts

require('react-styl')(`
  .admin-products
    line-height: 1.25rem
    tr
      td:first-child
        width: 80px
      td
        vertical-align: middle
    .title
      font-weight: 600
      color: #000
    .price
      color: #666
      font-size: 14px
    .pic
      width: 60px
      height: 50px
      background-size: contain
      background-repeat: no-repeat
      background-position: center

`)
