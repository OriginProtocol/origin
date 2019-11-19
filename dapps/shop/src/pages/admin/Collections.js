import React from 'react'

import Paginate from 'components/Paginate'
import useCollections from 'utils/useCollections'

const AdminCollections = () => {
  const { collections } = useCollections()
  return (
    <>
      <h3>Collections</h3>
      <table className="table admin-products" style={{ width: 'auto' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th className="text-center"># Products</th>
          </tr>
        </thead>
        <tbody>
          {collections.map(collection => (
            <tr key={collection.id}>
              <td>{collection.title}</td>
              <td className="text-center">{collection.products.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Paginate total={collections.length} />
    </>
  )
}

export default AdminCollections
