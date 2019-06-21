import React from 'react'
import { fbt } from 'fbt-runtime'
import Categories from '@origin/graphql/src/constants/Categories'

const CategoriesEnum = require('Categories$FbtEnum') // Localized category names

const ChooseCategory = () => (
  <div className="choose-category">
    {Categories.root.map(([categoryId]) => (
      <a
        key={categoryId}
        href={`#category-${categoryId.split('.')[1]}`}
        className={`category ${categoryId.split('.')[1]}`}
        onClick={e => e.preventDefault()}
      >
        <fbt desc="category">
          <fbt:enum enum-range={CategoriesEnum} value={categoryId} />
        </fbt>
      </a>
    ))}
  </div>
)

export default ChooseCategory
