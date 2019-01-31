import React from 'react'
import { fbt } from 'fbt-runtime'

const CategoriesEnum = require('Categories$FbtEnum')

const Category = ({ listing, separator = '|' }) => {
  return (
    <>
      <CategoryName category={listing.category} />
      {` ${separator} `}
      <CategoryName category={listing.subCategory} />
    </>
  )
}

const CategoryName = ({ category }) => (
  <fbt desc="category">
    <fbt:enum enum-range={CategoriesEnum} value={category} />
  </fbt>
)

export default Category
