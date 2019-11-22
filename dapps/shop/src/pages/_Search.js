import React, { useRef, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import queryString from 'query-string'

import SearchIcon from 'components/icons/Search'

const Search = ({ onSearch }) => {
  const searchRef = useRef(null)
  const location = useLocation()
  const history = useHistory()
  const opts = queryString.parse(location.search)

  useEffect(() => {
    searchRef.current.addEventListener('search', e => doSearch(e.target.value))
  }, [searchRef])

  function doSearch(search) {
    const method = location.pathname === '/search' ? 'replace' : 'push'
    if (search) {
      history[method]({ pathname: '/search', search: `?q=${search}` })
    } else {
      history[method]('/')
    }
    if (onSearch && search) {
      onSearch()
    }
  }
  return (
    <div className="search">
      <SearchIcon />
      <input
        ref={searchRef}
        className="form-control mr-sm-2"
        type="search"
        defaultValue={opts.q || ''}
        placeholder="Search"
      />
    </div>
  )
}

export default Search

require('react-styl')(`
  .search
    position: relative
    input
      padding-left: 2.5rem
      border: 0
    svg
      position: absolute
      left: 0.5rem
      width: 1.25rem
      top: 0.625rem

`)
