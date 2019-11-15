import React from 'react'

import { useHistory, useLocation } from 'react-router-dom'
import queryString from 'query-string'

import usePaginate from 'utils/usePaginate'

const Paginate = ({ total }) => {
  const history = useHistory()
  const location = useLocation()
  const opts = queryString.parse(location.search)
  const { page, perPage } = usePaginate()
  const pages = Math.ceil(total / perPage)

  if (pages <= 1) return null

  const hasPrevious = page > pages
  const hasNext = page < pages

  function handlePage(newPage) {
    history.push({
      pathname: location.pathname,
      search: queryString.stringify({
        ...opts,
        page: newPage === 1 ? undefined : newPage
      })
    })
    window.scrollTo(0, 0)
  }

  return (
    <ul className="pagination justify-content-center">
      <li className={`page-item${hasPrevious ? '' : ' disabled'}`}>
        <a
          className="page-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            if (hasPrevious) {
              handlePage(page - 1)
            }
          }}
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      {[...Array(pages)].map((_, i) => (
        <li key={i} className={`page-item${page === i + 1 ? ' active' : ''}`}>
          <a
            className="page-link"
            href="#"
            onClick={e => {
              e.preventDefault()
              if (page !== i + 1) {
                handlePage(i + 1)
              }
            }}
          >
            {i + 1}
          </a>
        </li>
      ))}
      <li className={`page-item${hasNext ? '' : ' disabled'}`}>
        <a
          className="page-link"
          href="#"
          onClick={e => {
            e.preventDefault()
            if (hasNext) {
              handlePage(page + 1)
            }
          }}
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  )
}

export default Paginate
