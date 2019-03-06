import React from 'react'
import { fbt } from 'fbt-runtime'
import startCase from 'lodash/startCase'

const CategoriesEnum = require('Categories$FbtEnum')
const Category = ({ listing, separator = '|', showPrimary }) => {
  const { category, subCategory } = listing
  if (!category && !subCategory) return null

  const splitSubCat = (subCategory || '').split('.')
  const subCatStr = splitSubCat[splitSubCat.length - 1] || ''

  return (
    <>
      {showPrimary === false ? null : (
        <>
          {CategoriesEnum[category] ? (
            <CategoryName category={category} />
          ) : (
            category
          )}
          {` ${separator} `}
        </>
      )}
      {CategoriesEnum[subCategory] ? (
        <CategoryName category={subCategory} />
      ) : (
        startCase(subCatStr)
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
