import set from 'lodash/set'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'

export default function nextPageFactory(root) {
  return function nextPage(fetchMore, variables) {
    fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev
        const obj = cloneDeep(prev)
        set(obj, `${root}.pageInfo`, get(fetchMoreResult, `${root}.pageInfo`))
        set(obj, `${root}.nodes`, [
          ...get(obj, `${root}.nodes`),
          ...get(fetchMoreResult, `${root}.nodes`)
        ])
        return obj
      }
    })
  }
}
