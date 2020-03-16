import React, { useEffect, useReducer } from 'react'
import queryString from 'query-string'
import pick from 'lodash/pick'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import dayjs from 'dayjs'

import Link from 'components/Link'
import GalleryScroll from 'components/GalleryScroll'
import Gallery from 'components/Gallery'
import SimilarProducts from 'components/SimilarProducts'
import formatPrice from 'utils/formatPrice'
import useIsMobile from 'utils/useIsMobile'
import useConfig from 'utils/useConfig'
import dataUrl from 'utils/dataUrl'
import { useStateValue } from 'data/state'
import fetchProduct from 'data/fetchProduct'

function getOptions(product, offset) {
  const options = new Set(
    product.variants.map(variant => variant.options[offset])
  )
  return Array.from(options)
}

const reducer = (state, newState) => ({ ...state, ...newState })

function getImageForVariant(productData, variant) {
  if (productData && get(variant, 'image')) {
    const variantImage = productData.images.findIndex(
      i => variant.image.indexOf(i) >= 0
    )
    return variantImage > 0 ? variantImage : 0
  }
}

const Product = ({ history, location, match }) => {
  const [state, setState] = useReducer(reducer, {
    options: {},
    activeImage: 0,
    addedToCart: false,
    productData: undefined
  })
  const { options, activeImage, addedToCart, productData } = state

  const [{ collections }, dispatch] = useStateValue()
  const isMobile = useIsMobile()
  const { config } = useConfig()
  const opts = queryString.parse(location.search)

  useEffect(() => {
    async function setData(data) {
      const variant =
        data.variants.find(v => String(v.id) === opts.variant) ||
        data.variants[0]
      const newState = {
        productData: data,
        activeImage: 0,
        options: pick(variant, 'option1', 'option2', 'option3')
      }
      const imageForVariant = getImageForVariant(data, variant)
      if (imageForVariant !== undefined) {
        newState.activeImage = imageForVariant
      }
      setState(newState)
    }
    fetchProduct(match.params.id).then(setData)
  }, [match.params.id])

  function addToCart(product, variant) {
    setState({ addedToCart: true })
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
    const newState = { options: newOptions }
    const imageForVariant = getImageForVariant(productData, variant)
    if (imageForVariant !== undefined) {
      newState.activeImage = imageForVariant
    }
    setState(newState)
    history.replace(
      `${urlPrefix}/products/${match.params.id}${
        variant ? `?variant=${variant.id}` : ''
      }`
    )
  }

  const productOptions = productData.options || []
  const pics = productData.images.map(
    i => `${dataUrl()}${productData.id}/orig/${i}`
  )
  const lg = isMobile ? ' btn-lg' : ''
  let onSale
  if (productData.onSale) {
    const availableDate = dayjs(productData.onSale)
    if (availableDate.isAfter(dayjs())) {
      onSale = (
        <div className="on-sale mb-2">
          <b>On Sale:</b> {availableDate.format('MM-DD-YYYY')}
        </div>
      )
    }
  }

  const galleryProps = {
    pics,
    active: activeImage,
    onChange: activeId => {
      const variant = productData.variants.find(
        variant => variant.image === productData.images[activeId]
      )
      if (variant !== undefined) {
        setState({ options: pick(variant, 'option1', 'option2', 'option3') })
      }
    }
  }

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
            <GalleryScroll {...galleryProps} />
          ) : (
            <Gallery {...galleryProps} />
          )}
        </div>
        <div className="col-sm-5">
          <h3>{productData.title}</h3>
          {!productData.byline ? null : (
            <div className="byline mb-2">{productData.byline}</div>
          )}
          {!productData.author ? null : (
            <div className="author mb-2">
              {'by '}
              <a href={productData.authorLink}>{productData.author}</a>
            </div>
          )}
          {onSale}
          <div className="price mb-4">
            {formatPrice(get(variant, 'price'))}
            {config.freeShipping ? (
              <span className="shipping">FREE shipping</span>
            ) : null}
          </div>
          {!productOptions ||
          (productData.variants || []).length <= 1 ? null : (
            <div
              className={`product-options${
                productOptions.length <= 1 ? ' inline' : ''
              }`}
            >
              {productOptions.map((opt, idx) => (
                <div key={`${productData.id}-${idx}`}>
                  {`${opt}:`}
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
                {config.singleProduct ? null : (
                  <Link to="/" className={`btn btn-outline-primary${lg}`}>
                    Continue Shopping
                  </Link>
                )}
              </>
            ) : variant ? (
              <button
                onClick={() => {
                  addToCart(productData.id, variant)
                }}
                className={`btn btn-outline-primary${lg}`}
              >
                {onSale ? 'Pre-Order' : 'Add to Cart'}
              </button>
            ) : (
              <button className={`btn btn-outline-primary disabled${lg}`}>
                Unavailable
              </button>
            )}
          </div>
          <div
            className="mt-4 description"
            dangerouslySetInnerHTML={{ __html: productData.description }}
          />
        </div>
      </div>
      {!productData.descriptionLong ? null : (
        <div
          className="mt-4"
          dangerouslySetInnerHTML={{
            __html: productData.descriptionLong.replace(/\n/g, '<br/>')
          }}
        />
      )}
      <SimilarProducts product={productData} count={isMobile ? 4 : 3} />
    </div>
  )
}

export default Product

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
      &.inline > div
        flex-direction: row
        align-items: center
        select
          margin-left: 0.5rem
    .price
      font-size: 1.25rem
      .shipping
        opacity: 0.6
        font-weight: normal
        margin-left: 1rem
        font-size: 1rem
    .byline
      opacity: 0.6
    .actions
      *
        margin-right: 0.5rem
    .description
      white-space: pre-line
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
