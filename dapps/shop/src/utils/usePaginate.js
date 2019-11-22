import { useLocation } from 'react-router-dom'
import queryString from 'query-string'

function usePaginate() {
  const location = useLocation()
  const opts = queryString.parse(location.search)
  const page = opts.page ? Number(opts.page) : 1
  const perPage = opts.perPage ? Number(opts.perPage) : 30

  const start = (page - 1) * perPage
  const end = start + perPage

  return { page, perPage, start, end }
}

export default usePaginate
