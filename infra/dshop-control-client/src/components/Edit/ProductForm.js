import React, { useEffect, useRef, useState } from 'react'
import TagsInput from 'react-tagsinput'

import 'react-tagsinput/react-tagsinput.css'

import ImageUpload from 'components/Edit/ImageUpload'

const ProductForm = ({ product = {}, onSave }) => {
  const didMountRef = useRef(false)

  const [title, setTitle] = useState(product.title || '')
  const [description, setDescription] = useState(product.description || '')
  const [price, setPrice] = useState(Number(product.price) / 100 || 0)
  const [images, setImages] = useState(product.images || [])

  const [variants, setVariants] = useState(product.variants || [])
  const [options, setOptions] = useState(product.options || [])

  // Parse tags from variants
  const parsedTags = options
    .map((option, i) => {
      // Get unique options from each variant for the option being mapped
      return [...new Set(variants.map(v => v[`option${i + 1}`]).filter(x => x))]
    })
    .filter(x => x.length > 0)

  const [tags, setTags] = useState(parsedTags)

  useEffect(() => {
    // Only rerun in changes to tags, not on mount, otherwise variant customisations
    // will be overwritten on every load
    if (didMountRef.current) {
      updateVariants()
    } else {
      didMountRef.current = true
    }
  }, [tags])

  // Valid options must have title set and have tags
  const validOptions = options.filter(
    (o, i) => o !== null && tags[i] && tags[i].length > 0
  )

  const confirmVariantOverride = () => {
    return window.confirm(
      'Adding more tags will override any cutomization you may have done to existing variants, are you sure?'
    )
  }

  const handleOptionChange = (index, event) => {
    setOptions([
      ...options.slice(0, index),
      event.target.value,
      ...options.slice(index + 1)
    ])
  }

  const handleTagChange = (index, updatedTags) => {
    setTags([...tags.slice(0, index), updatedTags, ...tags.slice(index + 1)])
  }

  const updateVariants = () => {
    // Get the cartesian product of all the tags
    let cartesianProduct
    if (validOptions.length === 1) {
      cartesianProduct = tags[0].map(t => [t])
    } else if (validOptions.length > 1) {
      cartesianProduct = tags.reduce((acc, current) => {
        return acc.flatMap(c => current.map(n => [].concat(c, n)))
      })
    }

    if (!cartesianProduct) return

    const variants = cartesianProduct.map((p, i) => {
      return {
        id: i,
        available: true,
        title: p.join(' / '),
        option1: p[0] || null,
        option2: p[1] || null,
        option3: p[2] || null,
        options: p,
        price: Number(price) * 100
      }
    })

    setVariants(variants)
  }

  const setVariant = (index, variant) => {
    setVariants([
      ...variants.slice(0, index),
      variant,
      ...variants.slice(index + 1)
    ])
  }

  const getProduct = () => {
    return {
      title,
      description,
      price: Number(price) * 100,
      options,
      images,
      variants
    }
  }

  const handleSave = event => {
    event.preventDefault()
    if (!variants && title && price) {
      // Dshop requires at least one variant
      setVariants([
        {
          id: 0,
          available: true,
          title: title,
          option1: null,
          option2: null,
          option3: null,
          options: [],
          price: Number(price) * 100
        }
      ])
    }
    onSave(getProduct())
  }

  const renderOptions = () => {
    return options.map((option, i) => {
      return (
        <div className="row mb-3" key={i}>
          <div className="col-4">
            <input
              className="form-control"
              placeholder="Option name"
              onChange={e => handleOptionChange(i, e)}
              value={option || ''}
            />
          </div>
          <div className="col-8">
            <TagsInput
              value={tags[i] || []}
              onChange={t => handleTagChange(i, t)}
            />
          </div>
        </div>
      )
    })
  }

  return (
    <form className="mt-3 product-form" onSubmit={handleSave}>
      <div className="row">
        <div className="col">
          <h4 className="mb-4">Details</h4>
          <div className="form-group">
            <label>Title</label>
            <input
              className="form-control"
              onChange={e => setTitle(e.target.value)}
              value={title}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              className="form-control"
              onChange={e => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </div>
          <div className="form-group">
            <label>Price</label>
            <div className="input-group">
              <div className="input-group-prepend">
                <div className="input-group-text">$</div>
              </div>
              <input
                type="number"
                className="form-control"
                onChange={e => setPrice(e.target.value)}
                value={price}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <h4 className="mb-4">Images</h4>
          <ImageUpload images={images} setImages={setImages} />
        </div>
      </div>

      <h4 className="mt-5 mb-1">Variants</h4>
      <div className="mb-4">
        <small className="text-muted">
          Does this product having sizing or coloring options?
        </small>
      </div>
      {options.length > 0 && (
        <>
          <div className="row mb-3">
            <div className="col-4">Option Name</div>
            <div className="col-8">Options</div>
          </div>
          {renderOptions()}
        </>
      )}
      <button
        className="btn btn-sm btn-secondary mt-3"
        onClick={e => {
          e.preventDefault()
          if (options.length > 0) {
            if (confirmVariantOverride()) {
              setOptions([...options, null])
            }
          } else {
            setOptions([...options, null])
          }
        }}
        disabled={validOptions.length !== options.length}
      >
        Add Option
      </button>
      {variants.length > 0 && (
        <>
          <p className="mt-4">Variants that will be created:</p>
          <table className="table table-condensed table-striped table-bordered">
            <thead>
              <tr>
                <th width="100">Available</th>
                <th>Title</th>
                <th width="150">Price</th>
                {options.map((o, i) => {
                  if (tags[i] && tags[i].length > 0) {
                    return <th key={o}>{o}</th>
                  }
                })}
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, i) => {
                return (
                  <tr key={i}>
                    <td>
                      <input
                        type="checkbox"
                        checked={variant.available}
                        onChange={e =>
                          setVariant(i, {
                            ...variant,
                            available: e.target.checked
                          })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={variant.title}
                        onChange={e =>
                          setVariant(i, {
                            ...variant,
                            title: e.target.value
                          })
                        }
                        disabled={validOptions.length === 0}
                      />
                    </td>
                    <td>
                      <div className="input-group input-group-sm">
                        <div className="input-group-prepend">
                          <div className="input-group-text">$</div>
                        </div>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={Number(variant.price) / 100}
                          onChange={e =>
                            setVariant(i, {
                              ...variant,
                              price: Number(e.target.value) * 100
                            })
                          }
                          disabled={validOptions.length === 0}
                        />
                      </div>
                    </td>
                    {variant.options.map(tag => (
                      <td key={tag}>{tag}</td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}
      <div className="mt-5">
        <button type="submit" className="btn btn-lg btn-primary">
          Save Product
        </button>
      </div>
    </form>
  )
}

export default ProductForm

require('react-styl')(`
.react-tagsinput
  border: 1px solid #ced4da
  border-radius: 0.25rem
  background-color: var(--pale-grey-four)
  padding-top: 3px
.react-tagsinput-input
  margin-bottom: 3px
.react-tagsinput-tag
  padding: 3px
  margin-bottom: 3px
`)
