import React from 'react'
import { Link } from 'react-router-dom'
import { useStoreState } from 'pullstate'

import store from '@/store'

const Collections = () => {
  const collections = useStoreState(store, s => s.collections)

  const handleDelete = (event, i) => {
    event.preventDefault()
    const result = confirm('Are you sure you want to delete this collection?')
    if (result) {
      store.update(s => {
        s.collections = [
          ...s.collections.slice(0, i),
          ...s.collections.slice(i + 1)
        ]
      })
    }
  }

  return (
    <>
      <div className="d-flex justify-content-between">
        <h3>Collections</h3>
      </div>
      <Link to="/edit/collections/add">
        <button className="btn btn-lg btn-primary my-4">Add Collection</button>
      </Link>
      {collections.length > 0 ? (
        <table className="table table-bordered table-striped products">
          <thead>
            <tr>
              <th width="80%">Title</th>
              <th>Products</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection, i) => (
              <tr key={i}>
                <td>{collection.title}</td>
                <td>{collection.products && collection.products.length}</td>
                <td>
                  <Link to={`/edit/collections/edit/${i}`}>Edit</Link>
                </td>
                <td>
                  <a href="#" onClick={e => handleDelete(e, i)}>
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-5 text-muted text-center bg-light rounded">
          You don&apos;t have any collections yet
        </div>
      )}
    </>
  )
}

export default Collections
