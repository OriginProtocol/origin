import { useLocation } from 'react-router-dom'
import queryString from 'query-string'

function useSearchQuery() {
  const location = useLocation()
  return queryString.parse(location.search)
}

export default useSearchQuery
