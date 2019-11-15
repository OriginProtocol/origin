import sortBy from 'lodash/sortBy'

function sortProducts(products, sort) {
  if (sort === 'title-ascending') {
    return sortBy(products, p => p.title.toLowerCase())
  } else if (sort === 'title-descending') {
    return sortBy(products, p => p.title.toLowerCase()).reverse()
  } else if (sort === 'price-ascending') {
    return sortBy(products, p => p.price)
  } else if (sort === 'price-descending') {
    return sortBy(products, p => -p.price)
  }
  return products
}

export default sortProducts
