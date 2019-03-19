import get from 'lodash/get'

export default {
  listingFilters: config => {
    const filters = []
    const listingFilterConfig = get(config.filters, 'listings', {})
    for (const [name, value] of Object.entries(listingFilterConfig)) {
      if (value) {
        filters.push({
          name: name,
          value: value,
          valueType: 'STRING',
          operator: 'EQUALS'
        })
      }
    }
    return filters
  }
}
