import React from 'react'
import { fbt } from 'fbt-runtime'

const CategoriesEnum = require('Categories$FbtEnum')
const Category = ({ listing, separator = '|' }) => {
  const { category, subCategory } = listing
  const splitSubCat = (subCategory || '').split('.')
  return (
    <>
      {CategoriesEnum[category] ? (
        <CategoryName category={listing.category} />
      ) : (
        category
      )}
      {` ${separator} `}
      {CategoriesEnum[subCategory] ? (
        <CategoryName category={listing.subCategory} />
      ) : (
        splitSubCat[splitSubCat.length - 1]
      )}
    </>
  )
}

const CategoryName = ({ category }) => (
  <fbt desc="category">
    <fbt:enum enum-range={CategoriesEnum} value={category} />
  </fbt>
)

export default Category
