import get from 'lodash/get'

export default {
  listingFilters: (config) => {
    let filters = []
    let listingFilterConfig = get(config.filters, 'listings', {})
    for (let [name, value] of Object.entries(listingFilterConfig)) {
      filters.push({
        name: name,
        value: value,
        valueType: 'STRING',
        operator: 'EQUALS'
      })
    }
    return filters
  }
}
