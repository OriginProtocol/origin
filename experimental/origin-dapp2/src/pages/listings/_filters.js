import queryString from 'query-string'
import Categories from 'origin-graphql/src/constants/Categories'
import store from 'utils/store'
const memStore = store('memory')
import get from 'lodash/get'

const categories = Categories.root.map(c => ({
  id: c[0],
  type: c[0].split('.').slice(-1)[0]
}))
categories.unshift({ id: '', type: '' })

export function getFilters(search) {
  const filters = []
  const category = get(search, 'category')
  if (category && category.id) {
    filters.push({
      name: 'category',
      value: category.id,
      operator: 'EQUALS',
      valueType: 'STRING'
    })
  }
  if (search.priceMin) {
    filters.push({
      name: 'price.amount',
      value: search.priceMin,
      operator: 'GREATER_OR_EQUAL',
      valueType: 'FLOAT'
    })
  }
  if (search.priceMax) {
    filters.push({
      name: 'price.amount',
      value: search.priceMax,
      operator: 'LESSER_OR_EQUAL',
      valueType: 'FLOAT'
    })
  }
  return filters
}

export function getStateFromQuery(props) {
  const search = memStore.get('listingsPage.search', {})
  const getParams = queryString.parse(props.location.search)
  search.category = categories.find(c => c.type === getParams.category) || {}
  search.searchInput = getParams.q || ''
  if (getParams.priceMin) {
    search.priceMin = getParams.priceMin
  }
  if (getParams.priceMax) {
    search.priceMax = getParams.priceMax
  }
  return search
}
