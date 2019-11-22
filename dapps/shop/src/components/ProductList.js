import React from 'react'
import { useHistory, useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import dataUrl from 'utils/dataUrl'
import Link from 'components/Link'
import formatPrice from 'utils/formatPrice'

const ProductList = ({ products }) => {
  const history = useHistory()
  const match = useRouteMatch('/collections/:collection')
  const collectionParam = get(match, 'params.collection')
  const urlPrefix = collectionParam ? `/collections/${collectionParam}` : ''

  return (
    <div className="products">
      {products.length ? null : <div>No Products!</div>}
      {products.map(product => (
        <div
          key={product.id}
          className="product"
          onClick={() =>
            history.push({
              pathname: `${urlPrefix}/products/${product.id}`,
              state: { scrollToTop: true }
            })
          }
        >
          <div
            className="pic"
            style={{
              backgroundImage: `url(${dataUrl()}${product.id}/520/${
                product.image
              })`
            }}
          />
          <div className="product-body">
            <Link to={`${urlPrefix}/products/${product.id}`}>
              {product.title}
            </Link>
            <div className="price">{formatPrice(product.price)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ProductList
