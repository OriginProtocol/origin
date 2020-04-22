import React from 'react'

import Paginate from 'components/Paginate'
import useRest from 'utils/useRest'

const AdminEvents = () => {
  const { data = [], loading, error } = useRest('/events')

  return (
    <>
      <h3>Events</h3>
      {error ? (
        'Error'
      ) : loading ? (
        'Loading...'
      ) : (
        <table className="table admin-orders table-hover">
          <thead>
            <tr>
              <th>Listing</th>
              <th>Offer</th>
              <th>Name</th>
              <th>Timestamp</th>
              <th>IPFS</th>
            </tr>
          </thead>
          <tbody>
            {data.map(event => (
              <tr key={event.id}>
                <td>{event.listingId}</td>
                <td>{event.offerId}</td>
                <td>{event.eventName}</td>
                <td>{event.timestamp}</td>
                <td>{(event.ipfsHash || '').substr(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Paginate total={data.length} />
    </>
  )
}

export default AdminEvents
