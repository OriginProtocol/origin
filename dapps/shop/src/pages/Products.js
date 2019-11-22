import React from 'react'
import { useLocation, useRouteMatch } from 'react-router-dom'
import get from 'lodash/get'

import Link from 'components/Link'
import Paginate from 'components/Paginate'

import { useStateValue } from 'data/state'
import useProducts from 'utils/useProducts'
import usePaginate from 'utils/usePaginate'
import useSearchQuery from 'utils/useSearchQuery'
import sortProducts from 'utils/sortProducts'

import Categories from './_Categories'
import ProductList from 'components/ProductList'
import SortBy from 'components/SortBy'

const Products = () => {
  const location = useLocation()
  const opts = useSearchQuery()
  const match = useRouteMatch('/collections/:collection')
  const [{ productIndex, collections }] = useStateValue()
  const { products, loading, error } = useProducts()
  const { start, end } = usePaginate()

  const collectionParam = get(match, 'params.collection')
  const collection = collections.find(c => c.id === collectionParam)

  let filteredProducts = products
  const isSearch = location.pathname === '/search' && opts.q
  if (productIndex && isSearch) {
    filteredProducts = productIndex
      .search({ query: opts.q, depth: 1 })
      .map(p => products.find(product => product.id === p))
      .filter(p => p)
  } else if (collection && collection.products) {
    filteredProducts = collection.products
      .map(p => products.find(product => product.id === p))
      .filter(p => p)
  }

  filteredProducts = sortProducts(filteredProducts, opts.sort)

  const pagedProducts = filteredProducts.slice(start, end)

  return (
    <div className="row">
      <div className="col-md-3">
        <Categories />
      </div>
      <div className="col-md-9">
        {isSearch ? (
          <div className="collection">
            <div className="breadcrumbs">
              <Link to="/">Home</Link>
              <span>{`Search for "${opts.q}"`}</span>
            </div>
            <div className="d-flex flex-row justify-content-between align-items-center">
              <h3>
                {collection
                  ? collection.title
                  : `Your search for "${opts.q}" revealed the following:`}
              </h3>
            </div>
          </div>
        ) : collection ? (
          <div className="collection">
            <div className="breadcrumbs">
              <Link to="/">Home</Link>
              <span>{collection.title}</span>
            </div>
            <div className="d-flex flex-row justify-content-between align-items-center">
              <h3>{collection.title}</h3>
              <SortBy />
            </div>
          </div>
        ) : (
          <div className="collection" />
        )}

        {error ? (
          'Error loading products'
        ) : loading ? (
          'Loading...'
        ) : (
          <ProductList products={pagedProducts} />
        )}

        <Paginate total={filteredProducts.length} />
      </div>
    </div>
  )
}

export default Products

require('react-styl')(`
  .collection
    padding-top: 1rem
    border-top: 1px solid #eee
    margin-bottom: 2rem
    h3
      margin: 0
    .sort-by
      display: flex
      align-items: center
      white-space: nowrap
      select
        margin-left: 0.5rem
  .products
    display: grid
    grid-column-gap: 1.5rem
    grid-row-gap: 1.5rem
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr))
    .product
      .pic
        padding-top: 100%
        background-size: cover
        background-repeat: no-repeat
        background-position: center
        cursor: pointer
        &:hover
          opacity: 0.5
      .product-body
        text-align: center
        padding-top: 1rem
        margin-bottom: 1rem
        .price
          font-weight: bold
          margin-top: 0.25rem

  @media (max-width: 767.98px)
    .products
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr))

`)
