import React, { useState, useEffect } from 'react'
import queryString from 'query-string'
import pick from 'lodash/pick'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'

import Link from 'components/Link'
import GalleryScroll from 'components/GalleryScroll'
import Gallery from 'components/Gallery'
import SimilarProducts from 'components/SimilarProducts'
import formatPrice from 'utils/formatPrice'
import useIsMobile from 'utils/useIsMobile'
import dataUrl from 'utils/dataUrl'
import { useStateValue } from 'data/state'
import fetchProduct from 'data/fetchProduct'

import Categories from './_Categories'

function getOptions(product, offset) {
  const options = new Set(
    product.variants.map(variant => variant.options[offset])
  )
  return Array.from(options)
}

const Product = ({ history, location, match }) => {
  const [options, setOptions] = useState({})
  const [activeImage, setActiveImage] = useState(0)
  const [addedToCart, addToCartRaw] = useState(false)
  const [{ collections }, dispatch] = useStateValue()
  const [productData, setProductData] = useState()
  const isMobile = useIsMobile()
  const opts = queryString.parse(location.search)

  useEffect(() => {
    async function setData(data) {
      const variant =
        data.variants.find(v => String(v.id) === opts.variant) ||
        data.variants[0]
      setProductData(data)
      setActiveImage(0)
      setOptions(pick(variant, 'option1', 'option2', 'option3'))
      setImageForVariant(data, variant)
    }
    fetchProduct(match.params.id).then(setData)
  }, [match.params.id])

  function addToCart(product, variant) {
    addToCartRaw(true)
    dispatch({
      type: 'addToCart',
      item: { product, quantity: 1, variant: variant.id, price: variant.price }
    })
  }

  if (!productData) {
    return <div className="product-detail">Loading...</div>
  }

  const collectionParam = get(match, 'params.collection')
  const collection = collections.find(c => c.id === collectionParam)
  const urlPrefix = collectionParam ? `/collections/${collectionParam}` : ''

  const variant = productData.variants.find(v =>
    isEqual(options, pick(v, 'option1', 'option2', 'option3'))
  )

  function setOption(idx, value) {
    const newOptions = {
      ...options,
      [`option${idx}`]: value
    }
    const variant = productData.variants.find(v =>
      isEqual(newOptions, pick(v, 'option1', 'option2', 'option3'))
    )
    setOptions(newOptions)
    setImageForVariant(productData, variant)
    history.replace(
      `${urlPrefix}/products/${match.params.id}${
        variant ? `?variant=${variant.id}` : ''
      }`
    )
  }

  function setImageForVariant(productData, variant) {
    if (productData && get(variant, 'image')) {
      const variantImage = productData.images.findIndex(
        i => variant.image.indexOf(i) >= 0
      )
      setActiveImage(variantImage > 0 ? variantImage : 0)
    }
  }

  const productOptions = productData.options || []
  const pics = productData.images.map(
    i => `${dataUrl()}${productData.id}/orig/${i}`
  )
  const lg = isMobile ? ' btn-lg' : ''

  return (
    <div className="product-detail">
      {!collection ? null : (
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <Link to={`/collections/${collection.id}`}>{collection.title}</Link>
          <span>{productData.title}</span>
        </div>
      )}
      <div className="row">
        <div className="col-sm-7">
          {isMobile ? (
            <GalleryScroll pics={pics} active={activeImage} />
          ) : (
            <Gallery pics={pics} active={activeImage} />
          )}
        </div>
        <div className="col-sm-5">
          <h3>{productData.title}</h3>
          <div className="price mb-4">{formatPrice(productData.price)}</div>
          {!productOptions ||
          (productData.variants || []).length <= 1 ? null : (
            <div className="product-options">
              {productOptions.map((opt, idx) => (
                <div key={`${productData.id}-${idx}`}>
                  {opt}
                  <select
                    className="form-control form-control-sm"
                    value={options[`option${idx + 1}`] || ''}
                    onChange={e => setOption(idx + 1, e.target.value)}
                  >
                    {getOptions(productData, idx).map((item, idx) => (
                      <option key={idx}>{item}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
          <div className="actions">
            {addedToCart ? (
              <>
                <Link to="/cart" className={`btn btn-primary${lg}`}>
                  View Cart
                </Link>
                <Link to="/" className={`btn btn-outline-primary${lg}`}>
                  Continue Shopping
                </Link>
              </>
            ) : variant ? (
              <button
                onClick={() => addToCart(productData.id, variant)}
                className={`btn btn-outline-primary${lg}`}
              >
                Add to Cart
              </button>
            ) : (
              <button className={`btn btn-outline-primary disabled${lg}`}>
                Unavailable
              </button>
            )}
          </div>
          <div
            className="mt-4"
            dangerouslySetInnerHTML={{ __html: productData.description }}
          />
        </div>
      </div>
      <SimilarProducts product={productData} />
    </div>
  )
}

const ProductWrap = props => (
  <div className="row">
    <div className="col-md-3">
      <Categories />
    </div>
    <div className="col-md-9">
      <Product {...props} />
    </div>
  </div>
)

export default ProductWrap

require('react-styl')(`
  .product-detail
    border-top: 1px solid #eee
    padding-top: 2rem
    .breadcrumbs
      margin-top: -1rem
    .product-options
      display: flex
      margin-bottom: 2rem
      .form-control
        width: auto
      > div
        margin-right: 1rem
        display: flex
        flex-direction: column
        &:last-of-type
          margin-right: 0
    .actions
      *
        margin-right: 0.5rem
  @media (max-width: 767.98px)
    .product-detail
      h3,.price,.actions
        text-align: center
      .product-options
        justify-content: center
        text-align: center
      .actions
        display: flex
        flex-direction: column
        justify-content: center
        *
          margin-bottom: 0.5rem
`)
