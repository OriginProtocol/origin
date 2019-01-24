import Categories from 'origin-graphql/src/constants/Categories'

function category(listing, separator = '|') {
  const cat = Categories.lookup[listing.category] || listing.category
  const subCat = Categories.lookup[listing.subCategory] || listing.subCategory
  return `${cat} ${separator} ${subCat}`
}

export default category
