import React from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import queryString from 'query-string'

const SortBy = () => {
  const location = useLocation()
  const history = useHistory()
  const opts = queryString.parse(location.search)
  return (
    <div className="sort-by">
      <select
        className="form-control form-control-sm"
        value={opts.sort || 'manual'}
        onChange={e => {
          const sort = e.target.value
          history.replace({
            pathname: location.pathname,
            search: sort === 'manual' ? null : `?sort=${sort}`
          })
        }}
      >
        <option value="manual">Sort by: Featured</option>
        <option value="title-ascending">Sort by: Title, A-Z</option>
        <option value="title-descending">Sort by: Title, Z-A</option>
        <option value="price-ascending">Sort by: Price, low to high</option>
        <option value="price-descending">Sort by: Price, high to low</option>
        {/* <option value="created-descending">Date, new to old</option>
                <option value="created-ascending">Date, old to new</option> */}
      </select>
    </div>
  )
}
export default SortBy
