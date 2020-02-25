import React from 'react'
import get from 'lodash/get'

import Paginate from 'components/Paginate'

import useRest from 'utils/useRest'

const AdminEvents = () => {
  const { data, loading } = useRest('/events')

  const rows = get(data, 'rows', [])

  return (
    <>
      <h3>Events</h3>
      {loading ? (
        'Loading...'
      ) : (
        <table className="table admin-orders table-hover">
          <thead>
            <tr>
              <th>Hash</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(event => (
              <tr key={event.id}>
                <td>{event.transactionHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Paginate total={rows.length} />
    </>
  )
}

export default AdminEvents

require('react-styl')(`
`)
